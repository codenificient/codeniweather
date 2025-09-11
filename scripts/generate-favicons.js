const fs = require("fs");
const path = require("path");

// Create a simple favicon generator
const svgContent = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
  
  <!-- Sun rays -->
  <g fill="#fbbf24" opacity="0.9">
    <rect x="15" y="4" width="2" height="3" rx="1"/>
    <rect x="15" y="25" width="2" height="3" rx="1"/>
    <rect x="4" y="15" width="3" height="2" rx="1"/>
    <rect x="25" y="15" width="3" height="2" rx="1"/>
    <rect x="7.5" y="7.5" width="2" height="2" rx="1" transform="rotate(45 7.5 7.5)"/>
    <rect x="22.5" y="22.5" width="2" height="2" rx="1" transform="rotate(45 22.5 22.5)"/>
    <rect x="22.5" y="7.5" width="2" height="2" rx="1" transform="rotate(-45 22.5 7.5)"/>
    <rect x="7.5" y="22.5" width="2" height="2" rx="1" transform="rotate(-45 7.5 22.5)"/>
  </g>
  
  <!-- Sun center -->
  <circle cx="16" cy="16" r="6" fill="#fbbf24"/>
  
  <!-- Cloud -->
  <g fill="#e5e7eb" opacity="0.8">
    <ellipse cx="12" cy="20" rx="4" ry="3"/>
    <ellipse cx="16" cy="18" rx="5" ry="3.5"/>
    <ellipse cx="20" cy="20" rx="3" ry="2.5"/>
  </g>
</svg>`;

// Write the SVG to public directory
const publicDir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent);

// Create a simple HTML file that can be used to generate PNG favicons
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Favicon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        .size { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>CodeniWeather Favicon Generator</h1>
    <p>Click the buttons below to download favicon files:</p>
    
    <div class="size">
        <h3>16x16</h3>
        <canvas id="canvas16" width="16" height="16"></canvas>
        <button onclick="downloadFavicon(16)">Download 16x16</button>
    </div>
    
    <div class="size">
        <h3>32x32</h3>
        <canvas id="canvas32" width="32" height="32"></canvas>
        <button onclick="downloadFavicon(32)">Download 32x32</button>
    </div>
    
    <div class="size">
        <h3>180x180 (Apple Touch Icon)</h3>
        <canvas id="canvas180" width="180" height="180"></canvas>
        <button onclick="downloadFavicon(180)">Download 180x180</button>
    </div>
    
    <div class="size">
        <h3>192x192 (Android Chrome)</h3>
        <canvas id="canvas192" width="192" height="192"></canvas>
        <button onclick="downloadFavicon(192)">Download 192x192</button>
    </div>
    
    <div class="size">
        <h3>512x512 (Android Chrome)</h3>
        <canvas id="canvas512" width="512" height="512"></canvas>
        <button onclick="downloadFavicon(512)">Download 512x512</button>
    </div>
    
    <script>
        function drawWeatherIcon(canvas, size) {
            const ctx = canvas.getContext('2d');
            const scale = size / 32; // Scale based on 32x32 base
            
            // Background circle
            ctx.fillStyle = '#3b82f6';
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.arc(16 * scale, 16 * scale, 15 * scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Sun rays
            ctx.fillStyle = '#fbbf24';
            ctx.globalAlpha = 0.9;
            
            // Vertical rays
            ctx.fillRect(15 * scale, 4 * scale, 2 * scale, 3 * scale);
            ctx.fillRect(15 * scale, 25 * scale, 2 * scale, 3 * scale);
            ctx.fillRect(4 * scale, 15 * scale, 3 * scale, 2 * scale);
            ctx.fillRect(25 * scale, 15 * scale, 3 * scale, 2 * scale);
            
            // Diagonal rays
            ctx.save();
            ctx.translate(8.5 * scale, 8.5 * scale);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-1 * scale, -1 * scale, 2 * scale, 2 * scale);
            ctx.restore();
            
            ctx.save();
            ctx.translate(23.5 * scale, 23.5 * scale);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-1 * scale, -1 * scale, 2 * scale, 2 * scale);
            ctx.restore();
            
            ctx.save();
            ctx.translate(23.5 * scale, 8.5 * scale);
            ctx.rotate(-Math.PI / 4);
            ctx.fillRect(-1 * scale, -1 * scale, 2 * scale, 2 * scale);
            ctx.restore();
            
            ctx.save();
            ctx.translate(8.5 * scale, 23.5 * scale);
            ctx.rotate(-Math.PI / 4);
            ctx.fillRect(-1 * scale, -1 * scale, 2 * scale, 2 * scale);
            ctx.restore();
            
            // Sun center
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(16 * scale, 16 * scale, 6 * scale, 0, 2 * Math.PI);
            ctx.fill();
            
            // Cloud
            ctx.fillStyle = '#e5e7eb';
            ctx.globalAlpha = 0.8;
            
            // Cloud parts
            ctx.beginPath();
            ctx.ellipse(12 * scale, 20 * scale, 4 * scale, 3 * scale, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(16 * scale, 18 * scale, 5 * scale, 3.5 * scale, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(20 * scale, 20 * scale, 3 * scale, 2.5 * scale, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        function downloadFavicon(size) {
            const canvas = document.getElementById(\`canvas\${size}\`);
            drawWeatherIcon(canvas, size);
            
            const link = document.createElement('a');
            link.download = \`favicon-\${size}x\${size}.png\`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Draw all canvases on load
        window.onload = function() {
            drawWeatherIcon(document.getElementById('canvas16'), 16);
            drawWeatherIcon(document.getElementById('canvas32'), 32);
            drawWeatherIcon(document.getElementById('canvas180'), 180);
            drawWeatherIcon(document.getElementById('canvas192'), 192);
            drawWeatherIcon(document.getElementById('canvas512'), 512);
        };
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, "favicon-generator.html"), htmlContent);

console.log("✅ Favicon files generated!");
console.log("📁 SVG favicon created: public/favicon.svg");
console.log("🌐 HTML generator created: public/favicon-generator.html");
console.log(
  "📝 Open public/favicon-generator.html in your browser to generate PNG files"
);
