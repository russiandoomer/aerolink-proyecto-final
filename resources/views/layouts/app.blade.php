<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'AeroLink')</title>
    <style>
        :root {
            --bg: #eef2f6;
            --panel: #ffffff;
            --primary: #10304f;
            --primary-dark: #0c243b;
            --accent: #11736d;
            --text: #14263d;
            --muted: #617085;
            --border: #d7dde8;
            --success: #18794e;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background:
                radial-gradient(circle at top right, rgba(17, 115, 109, 0.08), transparent 30%),
                linear-gradient(180deg, #f6f8fb 0%, var(--bg) 100%);
            color: var(--text);
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        .container {
            width: min(1120px, calc(100% - 32px));
            margin: 0 auto;
            padding: 28px 0 42px;
        }

        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 18px 22px;
            margin-bottom: 24px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid var(--border);
            border-radius: 20px;
            box-shadow: 0 18px 40px rgba(15, 35, 58, 0.08);
            backdrop-filter: blur(12px);
        }

        .brand h1 {
            margin: 0;
            font-size: 24px;
        }

        .brand p {
            margin: 4px 0 0;
            color: var(--muted);
        }

        .nav {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .nav a,
        .button {
            display: inline-block;
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: #fff;
        }

        .nav a.active,
        .button.primary {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
        }

        .button.secondary {
            background: rgba(16, 48, 79, 0.08);
            color: var(--primary);
            border-color: rgba(16, 48, 79, 0.12);
        }

        .button.accent {
            background: var(--accent);
            color: #fff;
            border-color: var(--accent);
        }

        .card,
        .empty-state {
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.85);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 18px 40px rgba(15, 35, 58, 0.08);
        }

        .page-header,
        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .stack {
            display: grid;
            gap: 20px;
        }

        .hero h2,
        .page-title {
            margin: 0 0 8px;
        }

        .hero p {
            color: var(--muted);
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-top: 20px;
        }

        .stat-number {
            display: block;
            margin-top: 8px;
            font-size: 28px;
            font-weight: bold;
            color: var(--primary);
        }

        .quick-links {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }

        .hero-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
            gap: 18px;
            align-items: stretch;
        }

        .hero-primary h2 {
            font-size: clamp(30px, 4vw, 42px);
            line-height: 1.1;
        }

        .hero-primary p {
            max-width: 62ch;
            line-height: 1.7;
        }

        .hero-side {
            display: flex;
            flex-direction: column;
            gap: 14px;
            justify-content: space-between;
            background: linear-gradient(180deg, #10304f 0%, #173957 100%);
            color: #f1f6fc;
        }

        .hero-side h3,
        .hero-side p {
            margin: 0;
        }

        .hero-side p {
            color: rgba(241, 246, 252, 0.74);
            line-height: 1.6;
        }

        .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            font-size: 13px;
            font-weight: 600;
            width: fit-content;
        }

        .api-card {
            display: grid;
            gap: 14px;
        }

        .api-card strong {
            font-size: 15px;
        }

        .api-code {
            display: block;
            padding: 14px 16px;
            border-radius: 14px;
            background: #0b2237;
            color: #d8e8f8;
            font-family: Consolas, Monaco, monospace;
            font-size: 14px;
            overflow-wrap: anywhere;
        }

        .section-title {
            margin: 0 0 14px;
            font-size: 16px;
            color: var(--muted);
        }

        @media (max-width: 768px) {
            .topbar,
            .page-header,
            .panel-header,
            .hero-grid {
                flex-direction: column;
                align-items: flex-start;
            }

            .stats {
                grid-template-columns: 1fr;
            }

            .hero-grid {
                display: grid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="topbar">
            <div class="brand">
                <h1>AeroLink</h1>
                <p>Backend Laravel y API del sistema de simulacion aerea</p>
            </div>

            <nav class="nav">
                <a class="{{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}">Inicio</a>
                <a href="{{ url('/api/dashboard/resumen') }}">API</a>
                <a href="{{ env('FRONTEND_URL', 'http://127.0.0.1:5173') }}" target="_blank" rel="noreferrer">Frontend</a>
            </nav>
        </header>

        @yield('content')
    </div>
</body>
</html>
