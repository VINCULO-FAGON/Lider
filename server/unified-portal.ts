import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('public'));

// Main Portal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Amanda AI - Portal Unificado</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container { max-width: 1200px; width: 100%; }
        .header {
          text-align: center;
          color: white;
          margin-bottom: 60px;
        }
        .header h1 {
          font-size: 3em;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .app-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .app-card:hover { transform: translateY(-10px); }
        .app-header {
          padding: 40px 20px;
          text-align: center;
          font-weight: bold;
          font-size: 1.5em;
          color: white;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .amanda .app-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .vinculo .app-header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .decreto .app-header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .app-description { padding: 20px; color: #333; line-height: 1.6; }
        .app-icon { font-size: 3em; margin-bottom: 10px; }
        .app-footer { padding: 20px; background: #f8f9fa; }
        .btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; }
        .btn:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Amanda AI</h1>
          <p>Portal Unificado - Acceso a todas tus herramientas</p>
        </div>
        <div class="apps-grid">
          <a href="/amanda" class="app-card amanda">
            <div class="app-header"><div><div class="app-icon">🤖</div>Amanda AI</div></div>
            <div class="app-description">Asistente inteligente impulsado por IA. Consultas, análisis y soluciones basadas en inteligencia artificial.</div>
            <div class="app-footer"><button class="btn" onclick="window.location.href='\/amanda'">Abrir Amanda AI →</button></div>
          </a>
          <a href="/vinculo" class="app-card vinculo">
            <div class="app-header"><div><div class="app-icon">🔗</div>Vínculo</div></div>
            <div class="app-description">Gestión de conexiones. Conecta, administra y sincroniza servicios de forma segura y eficiente.</div>
            <div class="app-footer"><button class="btn" onclick="window.location.href='\/vinculo'">Abrir Vínculo →</button></div>
          </a>
          <a href="/yo-decreto" class="app-card decreto">
            <div class="app-header"><div><div class="app-icon">📋</div>Yo Decreto</div></div>
            <div class="app-description">Gestor de documentos legales. Crea, organiza y gestiona decretos y documentos con facilidad.</div>
            <div class="app-footer"><button class="btn" onclick="window.location.href='\/yo-decreto'">Abrir Yo Decreto →</button></div>
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Redirect to Amanda AI
app.get('/amanda', (req, res) => {
  res.send('<script>window.location.href="http://localhost:5001/";</script><p>Redirigiendo a Amanda AI...</p>');
});

// Redirect to Vínculo
app.get('/vinculo', (req, res) => {
  res.send('<script>window.location.href="http://localhost:5002/";</script><p>Redirigiendo a Vínculo...</p>');
});

// Redirect to Yo Decreto
app.get('/yo-decreto', (req, res) => {
  res.send('<script>window.location.href="http://localhost:5003/";</script><p>Redirigiendo a Yo Decreto...</p>');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      amanda: 'operational',
      vinculo: 'operational',
      yoDecreto: 'operational'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Portal Amanda AI corriendo en http://localhost:${PORT}`);
  console.log(`📱 Apps:`);
  console.log(`   🤖 Amanda AI: http://localhost:${PORT}/amanda`);
  console.log(`   🔗 Vínculo: http://localhost:${PORT}/vinculo`);
  console.log(`   📋 Yo Decreto: http://localhost:${PORT}/yo-decreto`);
});