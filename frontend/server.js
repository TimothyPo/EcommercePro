const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');
const app = express();

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});



// Proxy API requests to the backend
app.use('/api', (req, res) => {
  console.log(`Proxying request to backend: ${req.url}`);
  
  // Special handling for token endpoint
  if (req.url === '/token/') {
    console.log('Handling token request directly to /api/token/');
    const options = {
      hostname: '0.0.0.0',
      port: 8000,
      path: '/api/token/',
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (req.headers.authorization) {
      options.headers['Authorization'] = req.headers.authorization;
    }
    
    const proxyReq = http.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      
      proxyRes.on('end', () => {
        try {
          // Attempt to parse response as JSON
          const jsonData = JSON.parse(body);
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = proxyRes.statusCode;
          res.end(JSON.stringify(jsonData));
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          res.statusCode = proxyRes.statusCode || 500;
          res.end(body);
        }
      });
    });
    
    proxyReq.on('error', (error) => {
      console.error('Token proxy request error:', error);
      res.status(500).json({ error: 'Error connecting to authentication service' });
    });
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    
    proxyReq.end();
    return;
  }
  
  // For proxying auth and profile routes
  if (req.url.startsWith('/auth/') || req.url.startsWith('/profile/')) {
    const options = {
      hostname: '0.0.0.0',
      port: 8000,
      path: `/api${req.url}`,
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (req.headers.authorization) {
      options.headers['Authorization'] = req.headers.authorization;
    }
    
    const proxyReq = http.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      
      proxyRes.on('end', () => {
        let responseData = body;
        try {
          // Try to parse as JSON to check if it's a valid JSON response
          const jsonData = JSON.parse(body);
          responseData = JSON.stringify(jsonData);
          res.setHeader('Content-Type', 'application/json');
        } catch (e) {
          // If not JSON, just pass through as text
        }
        
        res.statusCode = proxyRes.statusCode;
        res.end(responseData);
      });
    });
    
    proxyReq.on('error', (error) => {
      console.error('Proxy request error:', error);
      res.status(500).json({ error: 'Error connecting to backend service' });
    });
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    
    proxyReq.end();
    return;
  }
  
  // For all other API routes
  const options = {
    hostname: '0.0.0.0',
    port: 8000,
    path: `/api${req.url}`,
    method: req.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (req.headers.authorization) {
    options.headers['Authorization'] = req.headers.authorization;
  }
  
  const proxyReq = http.request(options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => {
      body += chunk;
    });
    
    proxyRes.on('end', () => {
      res.statusCode = proxyRes.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(body);
    });
  });
  
  proxyReq.on('error', (error) => {
    console.error('Proxy request error:', error);
    res.status(500).json({ error: 'Error connecting to backend service' });
  });
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
  
  proxyReq.end();
});

// Process HTML files to inject environment variables
app.use((req, res, next) => {
  // Only process HTML files
  if (!req.path.endsWith('.html') && req.path !== '/') {
    return next();
  }
  
  const filePath = req.path === '/' 
    ? path.join(__dirname, 'dist', 'index.html')
    : path.join(__dirname, 'dist', req.path);
    
  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return next();
      }
      
      // Replace environment variable placeholders
      let processedData = data.replace('${process.env.VITE_STRIPE_PUBLIC_KEY}', process.env.VITE_STRIPE_PUBLIC_KEY || '');
      
      res.set('Content-Type', 'text/html');
      res.send(processedData);
    });
  } else {
    next();
  }
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Custom route handler function to process HTML templates
function serveHtmlTemplate(req, res, templatePath) {
  const filePath = path.join(__dirname, 'dist', templatePath);
  console.log(`Serving ${filePath}`);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return res.status(500).send('Error loading page');
    }
    
    // Replace environment variable placeholders
    let processedData = data.replace('${process.env.VITE_STRIPE_PUBLIC_KEY}', process.env.VITE_STRIPE_PUBLIC_KEY || '');
    
    res.set('Content-Type', 'text/html');
    res.send(processedData);
  });
}

// Explicit routes for HTML files
app.get('/', (req, res) => {
  console.log("Serving index.html");
  serveHtmlTemplate(req, res, 'index.html');
});

app.get('/login', (req, res) => {
  console.log("Serving login.html");
  serveHtmlTemplate(req, res, 'login.html');
});

app.get('/login.html', (req, res) => {
  console.log("Serving login.html");
  serveHtmlTemplate(req, res, 'login.html');
});

app.get('/register', (req, res) => {
  console.log("Serving register.html");
  serveHtmlTemplate(req, res, 'register.html');
});

app.get('/register.html', (req, res) => {
  console.log("Serving register.html");
  serveHtmlTemplate(req, res, 'register.html');
});

app.get('/checkout', (req, res) => {
  console.log("Serving checkout.html");
  serveHtmlTemplate(req, res, 'checkout.html');
});

app.get('/checkout.html', (req, res) => {
  console.log("Serving checkout.html");
  serveHtmlTemplate(req, res, 'checkout.html');
});

app.get('/payment-success', (req, res) => {
  console.log("Serving payment-success.html");
  serveHtmlTemplate(req, res, 'payment-success.html');
});

app.get('/payment-success.html', (req, res) => {
  console.log("Serving payment-success.html");
  serveHtmlTemplate(req, res, 'payment-success.html');
});

app.get('/admin/dashboard', (req, res) => {
  console.log("Serving admin/dashboard.html");
  serveHtmlTemplate(req, res, 'admin/dashboard.html');
});

app.get('/admin/dashboard.html', (req, res) => {
  console.log("Serving admin/dashboard.html");
  serveHtmlTemplate(req, res, 'admin/dashboard.html');
});

app.get('/admin/products', (req, res) => {
  console.log("Serving admin/products.html");
  serveHtmlTemplate(req, res, 'admin/products.html');
});

app.get('/admin/products.html', (req, res) => {
  console.log("Serving admin/products.html");
  serveHtmlTemplate(req, res, 'admin/products.html');
});

app.get('/admin/orders', (req, res) => {
  console.log("Serving admin/orders.html");
  serveHtmlTemplate(req, res, 'admin/orders.html');
});

app.get('/admin/orders.html', (req, res) => {
  console.log("Serving admin/orders.html");
  serveHtmlTemplate(req, res, 'admin/orders.html');
});

// Handle the default routes
app.get('/profile', (req, res) => {
  console.log("Serving index.html for profile route");
  serveHtmlTemplate(req, res, 'index.html');
});

app.get('/orders', (req, res) => {
  console.log("Serving orders.html for orders route");
  serveHtmlTemplate(req, res, 'orders.html');
});

app.get('/orders.html', (req, res) => {
  console.log("Serving orders.html");
  serveHtmlTemplate(req, res, 'orders.html');
});

// Catch-all route for anything not explicitly handled
app.use((req, res) => {
  console.log(`Fallback handler for: ${req.path}`);
  
  // Return index.html for all non-API, non-asset requests
  // This supports client-side routing
  serveHtmlTemplate(req, res, 'index.html');
});

// Use port 5000 as required in the specs
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server is running on http://0.0.0.0:${port}`);
});
