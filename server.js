import express from 'express';

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

const projects = [];
let nextId = 1;

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const { name, status } = req.body;

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    !['Planned', 'In Progress', 'Completed'].includes(status)
  ) {
    return res.status(400).json({ error: 'Invalid project data' });
  }

  const project = {
    id: nextId++,
    name: name.trim(),
    status
  };

  projects.push(project);
  res.status(201).json(project);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});