import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Download,
  AlertCircle,
  Sparkles,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { VocabularyItem } from '../types';

interface VocabularyPageProps {
  vocabulary: VocabularyItem[];
  onAddWord: (item: Omit<VocabularyItem, 'id' | 'dateAdded' | 'timesRecovered'>) => void;
  onDeleteWord: (id: string) => void;
}

export const VocabularyPage: React.FC<VocabularyPageProps> = ({
  vocabulary,
  onAddWord,
  onDeleteWord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New word form state
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState<VocabularyItem['category']>('Dining');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredWords = vocabulary.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    onAddWord({
      word: newWord.trim(),
      category: newCategory,
      phoneticHint: newPhonetic.trim() || `/${newWord.toLowerCase()}/`,
      notes: newNotes.trim(),
    });

    setNewWord('');
    setNewPhonetic('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const exportVocabularyCsv = () => {
    let csv = 'Word,Category,PhoneticHint,TimesRecovered,Notes\n';
    vocabulary.forEach((item) => {
      csv += `"${item.word}","${item.category}","${item.phoneticHint}",${item.timesRecovered},"${item.notes || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hearwise-vocabulary.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600" />
            My Personal Vocabulary & Phonetic Dictionary
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Train contextual priors on words and technical terms frequently obscured by background noise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportVocabularyCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Research Disclaimer Card */}
      <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Assistive Tech Notice: </span>
          Saved vocabulary entries are treated as optional Bayesian linguistic priors to aid ambiguous speech disambiguation. They are never treated as conclusive proof that a speaker uttered that specific word.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search custom vocabulary or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {['All', 'Dining', 'Medical', 'Work', 'Everyday', 'Names'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {item.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {item.timesRecovered}x assisted
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.word}
              </h2>

              <p className="text-xs font-mono text-slate-500 mb-2">
                {item.phoneticHint}
              </p>

              {item.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                  {item.notes}
                </p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                Added {item.dateAdded}
              </span>

              <button
                onClick={() => onDeleteWord(item.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="Remove word from vocabulary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              Add Custom Vocabulary Item
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Add proper nouns, medical terms, or restaurant items that are frequently misheard.
            </p>

            <form onSubmit={handleCreateWord} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Word or Phrase *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. marinara, audiologist, cochlear"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
                >
                  <option value="Dining">Dining</option>
                  <option value="Medical">Medical</option>
                  <option value="Work">Work</option>
                  <option value="Everyday">Everyday</option>
                  <option value="Names">Names</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phonetic / Acoustic Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /ˈsɔːs/ sibilant alveolar fricative"
                  value={newPhonetic}
                  onChange={(e) => setNewPhonetic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Context Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Common pasta sauce at local Italian diner"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Save Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
