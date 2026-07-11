import fs from 'node:fs';
import path from 'node:path';

export interface Task {
  id: string;
  title: string;
  status: 'unchecked' | 'done' | string;
}

export interface Work {
  title: string;
  status: string;
  tasks: Task[];
}

export interface Boulder {
  active_work_id: string;
  works: Record<string, Work>;
}

export function readBoulder(projectDir?: string): Boulder | null {
  const dir = projectDir ?? process.env.OMO_KIMI_PROJECT ?? process.cwd();
  const p = path.join(dir, '.omo', 'boulder.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) as Boulder : null;
}

export function hasUncheckedTasks(boulder: Boulder | null): boolean {
  if (!boulder?.active_work_id) return false;
  const work = boulder.works?.[boulder.active_work_id];
  if (!work) return false;
  return work.tasks.some((t) => t.status === 'unchecked');
}

export function formatResumeContext(boulder: Boulder): string {
  const work = boulder.works[boulder.active_work_id];
  if (!work) return 'Active work not found. Please check .omo/boulder.json.';
  const unchecked = work.tasks.filter((t) => t.status === 'unchecked');
  const lines = [
    `Active work: ${work.title}`,
    `Unchecked tasks (${unchecked.length}):`,
    ...unchecked.map((t) => `- ${t.id}: ${t.title}`),
    'Please finish these tasks before you continue.',
  ];
  return lines.join('\n');
}
