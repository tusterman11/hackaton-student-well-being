import { useState } from 'react';
import { BookOpen, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { createId, formatDateTime } from '../utils/wellnessData';

export function JournalView({ localData, onUpdateLocalData }) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function resetForm() {
    setEditingId(null);
    setText('');
    setError('');
  }

  function saveEntry(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content) {
      setError('Escreva algo antes de salvar.');
      return;
    }

    if (editingId) {
      onUpdateLocalData((data) => ({
        ...data,
        diary: data.diary.map((entry) => (
          entry.id === editingId
            ? { ...entry, text: content, updatedAt: new Date().toISOString() }
            : entry
        ))
      }));
    } else {
      const createdAt = new Date().toISOString();
      onUpdateLocalData((data) => ({
        ...data,
        diary: [{ id: createId(), text: content, createdAt, updatedAt: createdAt }, ...data.diary]
      }));
    }
    resetForm();
  }

  function editEntry(entry) {
    setEditingId(entry.id);
    setText(entry.text);
    setError('');
    document.getElementById('journal-entry')?.focus();
  }

  function deleteEntry(id) {
    onUpdateLocalData((data) => ({ ...data, diary: data.diary.filter((entry) => entry.id !== id) }));
    if (editingId === id) resetForm();
  }

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Diário pessoal</p>
        <h1>Um espaço para suas ideias</h1>
        <p>Escreva livremente. Seus registros ficam neste navegador.</p>
      </header>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">{editingId ? 'Editar registro' : 'Novo registro'}</p><h2>{editingId ? 'Atualize sua anotação' : 'O que gostaria de registrar?'}</h2></div>
          <span className="section-icon"><BookOpen size={20} /></span>
        </div>
        <form onSubmit={saveEntry}>
          <label className="field-label" htmlFor="journal-entry">Anotação</label>
          <textarea
            id="journal-entry"
            className="text-area"
            rows={5}
            maxLength={5000}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Uma ideia, algo que aconteceu ou como você está se sentindo…"
          />
          <div className="form-meta"><span>{text.length}/5000</span><span>A data é registrada automaticamente</span></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? <Save size={17} /> : <Plus size={17} />}
              {editingId ? 'Salvar alterações' : 'Salvar registro'}
            </button>
            {editingId && <button type="button" className="button button-quiet" onClick={resetForm}><X size={17} /> Cancelar edição</button>}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Seu histórico</p><h2>Registros do diário ({localData.diary.length})</h2></div>
        </div>
        {localData.diary.length === 0 ? (
          <p className="empty-state">Ainda não há anotações. Seu primeiro registro aparecerá aqui.</p>
        ) : (
          <div className="journal-list">
            {[...localData.diary].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((entry) => (
              <article className="journal-entry" key={entry.id}>
                <div className="record-list-heading">
                  <time>{formatDateTime(entry.createdAt)}</time>
                  <div className="entry-actions">
                    <button type="button" className="icon-button" aria-label="Editar anotação" onClick={() => editEntry(entry)}><Pencil size={17} /></button>
                    <button type="button" className="icon-button danger-action" aria-label="Excluir anotação" onClick={() => deleteEntry(entry.id)}><Trash2 size={17} /></button>
                  </div>
                </div>
                <p>{entry.text}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
