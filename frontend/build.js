const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create necessary directories if they don't exist
const directories = [
  'dist',
  'src/components',
  'src/views',
  'src/views/admin',
  'src/store/modules',
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create a simple build output
const buildHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Commerce System</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
  <style>
    /* Base Styles */
    html, body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
    }
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      padding-bottom: 2rem;
    }
    .card {
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .product-image-container {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .product-image {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="app-container">
      <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div class="container">
          <a class="navbar-brand" href="/">
            <i class="bi bi-shop me-2"></i>
            E-Shop
          </a>
          <div class="ms-auto">
            <a class="btn btn-outline-primary me-2" href="/login">Login</a>
            <a class="btn btn-primary" href="/register">Register</a>
          </div>
        </div>
      </nav>
      
      <div class="container py-5">
        <div class="row mb-4">
          <div class="col-12">
            <h1 class="mb-4">Shop Our Products</h1>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="text-muted mb-0">Showing 5 products</p>
              <div class="input-group w-auto" style="max-width: 300px;">
                <input type="text" class="form-control" placeholder="Search products...">
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row g-4" id="product-container">
          <!-- Products will be loaded dynamically -->
        </div>
      </div>
      
      <footer class="bg-light py-4 mt-auto">
        <div class="container">
          <div class="row">
            <div class="col-md-6 text-center text-md-start">
              <p class="mb-0">&copy; 2025 E-Commerce System. All rights reserved.</p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <p class="mb-0">Developed with Vue.js and Django</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
  <script>
    // Fetch products from API when the page loads
    document.addEventListener('DOMContentLoaded', () => {
      fetch('/api/products/')
        .then(response => response.json())
        .then(products => {
          const productContainer = document.getElementById('product-container');
          
          if (products.length === 0) {
            productContainer.innerHTML = '<div class="col-12 text-center py-5"><h3>No products available</h3></div>';
            return;
          }
          
          products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-6 col-lg-4';
            productCard.innerHTML = \`
              <div class="card h-100">
                <div class="product-image-container">
                  <img src="\${product.image_url}" class="product-image" alt="\${product.name}">
                </div>
                <div class="card-body">
                  <h5 class="card-title">\${product.name}</h5>
                  <p class="card-text text-truncate">\${product.description}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fs-5 fw-bold">$\${product.price}</span>
                    <button class="btn btn-primary">
                      <i class="bi bi-cart-plus me-1"></i> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            \`;
            productContainer.appendChild(productCard);
          });
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          const productContainer = document.getElementById('product-container');
          productContainer.innerHTML = '<div class="col-12 text-center py-5"><h3>Error loading products</h3><p>Please try again later.</p></div>';
        });
    });
  </script>
</body>
</html>
`;

// Write the HTML to the dist folder
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), buildHtml);
console.log('Created dist/index.html');

console.log('Build completed successfully!');