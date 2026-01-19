
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#10b981">
    <title>সাঈদ এআই</title>
    <link rel="manifest" href="manifest.json">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- KaTeX for beautiful math formulas -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
    
    <!-- Google Identity Services -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>

    <style>
        body {
            font-family: 'Hind Siliguri', sans-serif;
            -webkit-tap-highlight-color: transparent;
            overflow-x: hidden;
            background-color: #f9fafb;
            position: fixed;
            width: 100%;
            height: 100%;
        }
        #root {
            height: 100%;
        }
        ::-webkit-scrollbar {
            width: 0px;
        }
        .katex-display {
            margin: 0.8em 0;
            overflow-x: auto;
            padding: 4px;
        }
    </style>
<script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "@google/genai": "https://esm.sh/@google/genai@^1.37.0",
    "vite": "https://esm.sh/vite@^7.3.1",
    "firebase/": "https://esm.sh/firebase@^12.8.0/"
  }
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
<body class="bg-gray-50 text-gray-900 transition-colors duration-200">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
</body>
</html>
      
