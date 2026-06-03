'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import {
  getAllUsers,
  getAllTopics,
  getQuestionsByTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuizResults,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic
} from '@/lib/db';

const MOCK_AI_BANK = {
  t_living_things: [
    { question: 'Which organism is capable of preparing its food through chemical synthesis (chemosynthesis) instead of sunlight?', options: ['Deep-sea hydrothermal bacteria', 'Green garden grass', 'A red rose plant', 'Desert saguaro cactus'], correctIndex: 0, explanation: 'In dark hydrothermal ocean vents, bacteria use sulfur chemosynthesis to manufacture sugar food, bypassing solar photosynthesis entirely.', difficulty: 9 },
    { question: 'What is the primary organic compound that makes up the cell wall of plant cells, providing structure?', options: ['Starch', 'Cellulose', 'Glycogen', 'Lactose'], correctIndex: 1, explanation: 'Cellulose is a strong carbohydrate fiber that gives plant cells their rigid rectangular shape, serving as wood structure.', difficulty: 8 },
    { question: 'Which of the following describes the unique process of respiration in green plants at night?', options: ['They absorb oxygen and release carbon dioxide', 'They absorb carbon dioxide and release oxygen', 'They stop breathing completely', 'They absorb salt minerals'], correctIndex: 0, explanation: 'At night, without sunlight for photosynthesis, plants perform cellular respiration, taking in oxygen and breathing out CO2 just like humans!', difficulty: 6 },
    { question: 'What do we call a permanent change in an organism\'s structure that helps it survive better in its habitat?', options: ['Germination', 'Adaptation', 'Reproduction', 'Transpiration'], correctIndex: 1, explanation: 'An adaptation is a beneficial genetic shift over generations, like a camel\'s hump storing fat or polar bear\'s thick insulation fur.', difficulty: 5 },
    { question: 'Which of the following is a unicellular (single-celled) living organism?', options: ['An earthworm', 'An amoeba', 'A maple tree leaf', 'A ladybug beetle'], correctIndex: 1, explanation: 'Amoebas are microscopic protists whose entire body consists of a single standalone cell that handles eating, moving, and dividing.', difficulty: 7 },
  ],
  t_water_cycle: [
    { question: 'What is the absolute boundary temperature (in Celsius) at which water vapor transitions directly into liquid dew?', options: ['Boiling Point (100°C)', 'Dew Point Temperature', 'Freezing Point (0°C)', 'Room Temperature (25°C)'], correctIndex: 1, explanation: 'The Dew Point is the atmospheric temperature at which air becomes 100% saturated with moisture, forcing vapor to condense.', difficulty: 8 },
    { question: 'Which of the following holds the largest percentage of the Earth\'s total fresh water reserve?', options: ['Rivers & Streams', 'Glaciers & Polar Ice Sheets', 'Atmospheric clouds', 'Underground soil moisture'], correctIndex: 1, explanation: 'Over 68% of Earth\'s fresh water is locked up as solid ice in massive polar ice caps and high glaciers!', difficulty: 7 },
    { question: 'What is the primary force that drives water downhill as surface runoff into lakes and seas?', options: ['Centrifugal pull', 'Gravity', 'Wind friction', 'Earth\'s rotation axis'], correctIndex: 1, explanation: 'Gravity is the master downward pull that drives liquid runoff across geographical basins, filling rivers and ocean basins.', difficulty: 4 },
    { question: 'How do warm wind currents accelerate the rate of evaporation from a wet surface?', options: ['By increasing atmospheric humidity', 'By carrying away saturated air and exposing dry spaces to absorb water vapor', 'By cooling the liquid down', 'By turning liquid into solid ice'], correctIndex: 1, explanation: 'Wind swept air moves humid, saturated layers away from the surface, letting dry air capture more moisture rapidly.', difficulty: 9 },
    { question: 'In the water cycle, what is the term for water vapor changing directly into solid ice crystals (like frost)?', options: ['Sublimation', 'Deposition / Desublimation', 'Condensation', 'Percolation'], correctIndex: 1, explanation: 'Deposition occurs when gas shifts straight to solid, skipping the liquid phase, forming intricate frost patterns on window glass.', difficulty: 10 },
  ],
  t_gravity_force: [
    { question: 'What is the terminal velocity of a falling object on Earth?', options: ['The speed of light', 'The maximum speed reached when opposing air resistance matches the downward pull of gravity', 'Zero speed', 'A constant 9.8 meters per second'], correctIndex: 1, explanation: 'Terminal velocity is reached when upward fluid drag equals downward gravity weight force, stopping all further fall acceleration.', difficulty: 8 },
    { question: 'Which type of simple machine utilizes a fulcrum point to multiply mechanical leverage?', options: ['Wedge', 'Lever', 'Pulley', 'Inclined Plane'], correctIndex: 1, explanation: 'Levers (like see-saws or crowbars) pivot on a central support called a fulcrum, amplifying input push to lift heavy masses.', difficulty: 5 },
    { question: 'Why does an object in motion continue moving forever in the vacuum of deep outer space?', options: ['Planetary gravity pulls it along', 'Inertia (Newton\'s first law) is maintained as there is no friction or air resistance to slow it down', 'It burns nuclear rocket fuel', 'Space magnets attract it'], correctIndex: 1, explanation: 'Newton\'s First Law! An object in motion remains in motion at a constant velocity unless acted upon by an external friction drag force.', difficulty: 9 },
    { question: 'How does double-increasing the distance between two masses impact the gravitational force between them?', options: ['The force doubles', 'The force decreases to one-fourth (Inverse-Square Law)', 'The force stays the same', 'The force is completely deleted'], correctIndex: 1, explanation: 'Newton\'s Inverse-Square Law! Gravitational attraction decreases exponentially with the square of the distance between centers.', difficulty: 10 },
    { question: 'Which friction force opposes a round sphere rolling across a solid hard surface?', options: ['Static friction', 'Rolling resistance / friction', 'Sliding friction', 'Fluid drag'], correctIndex: 1, explanation: 'Rolling friction is the tiny resisting force caused by micro-deformations on the spherical ball and runway surfaces in contact.', difficulty: 6 },
  ]
};

function AdminContent() {
  const { profile } = useAuth();
  const router = useRouter();

  // Tab state: 'stats' | 'topics' | 'questions' | 'users' | 'ai_generator'
  const [activeTab, setActiveTab] = useState('stats');

  // Database lists
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Form States
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // New/Edit Topic Form values
  const [topicForm, setTopicForm] = useState({ title: '', icon: '', classNum: 3, description: '', color: '#38bdf8' });
  // New/Edit Question Form values
  const [questionForm, setQuestionForm] = useState({ topicId: '', classNum: 3, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 2 });

  // AI Generator Tab States
  const [aiCount, setAiCount] = useState(3);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [saveAllProgress, setSaveAllProgress] = useState(null);
  const [aiProvider, setAiProvider] = useState('groq'); // 'groq' | 'openai'

  // NEW AI Generator States
  const [aiTab, setAiTab] = useState('syllabus'); // 'syllabus' | 'questions'
  const [topicQuery, setTopicQuery] = useState('');
  const [classGradeSyllabus, setClassGradeSyllabus] = useState(4);
  const [questionsPerSubtopic, setQuestionsPerSubtopic] = useState(3);
  const [generatedSyllabus, setGeneratedSyllabus] = useState(null);
  const [savingSyllabus, setSavingSyllabus] = useState(false);
  const [selectedQuestionsIndices, setSelectedQuestionsIndices] = useState([]);
  const [selectedSyllabusQuestions, setSelectedSyllabusQuestions] = useState({});
  const [existingQuestionsInSubtopic, setExistingQuestionsInSubtopic] = useState([]);

  // NEW Subtopics Manager States
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [subtopicForm, setSubtopicForm] = useState({ title: '', description: '', order: 1 });
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [savingSubtopic, setSavingSubtopic] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.email !== 'admin@justsciify.com') {
      router.push('/dashboard');
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const [uData, tData, rData] = await Promise.all([
          getAllUsers(100),
          getAllTopics(),
          getAllQuizResults(100)
        ]);
        setUsers(uData);
        setTopics(tData);
        setResults(rData);
        if (tData.length > 0) {
          const firstTopic = tData[0];
          setSelectedTopicId(firstTopic.$id);
          if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
            setSelectedSubtopicId(firstTopic.subtopics[0].$id || firstTopic.subtopics[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile, router]);

  // Sync selectedSubtopicId when selectedTopicId changes
  useEffect(() => {
    if (!selectedTopicId || topics.length === 0) return;
    const activeTopic = topics.find(t => t.$id === selectedTopicId || t.id === selectedTopicId);
    if (activeTopic && activeTopic.subtopics && activeTopic.subtopics.length > 0) {
      setSelectedSubtopicId(activeTopic.subtopics[0].$id || activeTopic.subtopics[0].id);
    } else {
      setSelectedSubtopicId('');
    }
  }, [selectedTopicId, topics]);

  // Load questions when selected topic changes
  useEffect(() => {
    if (!selectedTopicId) return;
    (async () => {
      try {
        const qData = await getQuestionsByTopic(selectedTopicId);
        setQuestions(qData);
      } catch (err) {
        console.error('Failed to load questions:', err);
      }
    })();
  }, [selectedTopicId]);

  // Load existing questions for active subtopic to check for duplicates
  useEffect(() => {
    if (!selectedSubtopicId) {
      setExistingQuestionsInSubtopic([]);
      return;
    }
    (async () => {
      try {
        const qData = await getQuestionsByTopic(selectedSubtopicId);
        setExistingQuestionsInSubtopic(qData);
      } catch (err) {
        console.error('Failed to load subtopic questions:', err);
      }
    })();
  }, [selectedSubtopicId]);

  // Auto-select booster questions by default (excluding existing duplicates)
  useEffect(() => {
    if (generatedQuestions && generatedQuestions.length > 0) {
      const initialSelected = [];
      generatedQuestions.forEach((q, idx) => {
        const duplicate = existingQuestionsInSubtopic.some(
          (eq) => eq.question.trim().toLowerCase() === q.question.trim().toLowerCase()
        );
        if (!duplicate) {
          initialSelected.push(idx);
        }
      });
      setSelectedQuestionsIndices(initialSelected);
    } else {
      setSelectedQuestionsIndices([]);
    }
  }, [generatedQuestions, existingQuestionsInSubtopic]);

  // Auto-select syllabus questions by default
  useEffect(() => {
    if (generatedSyllabus && generatedSyllabus.subtopics) {
      const initial = {};
      generatedSyllabus.subtopics.forEach((sub, sIdx) => {
        if (sub.questions) {
          sub.questions.forEach((_, qIdx) => {
            initial[`${sIdx}-${qIdx}`] = true;
          });
        }
      });
      setSelectedSyllabusQuestions(initial);
    } else {
      setSelectedSyllabusQuestions({});
    }
  }, [generatedSyllabus]);

  if (!profile || profile.email !== 'admin@justsciify.com') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#03050F' }}>
        <p className="font-display font-bold text-red-400 mb-4">🚫 Access Denied: Admins Only</p>
        <Link href="/dashboard">
          <button className="btn-primary px-6 py-2.5 rounded-xl text-white">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  // Handle Topic Form Actions
  const handleSaveTopic = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        const updated = await updateTopic(editingTopic.$id, topicForm);
        setTopics(topics.map((t) => (t.$id === editingTopic.$id ? updated : t)));
        setEditingTopic(null);
      } else {
        const created = await createTopic(topicForm);
        setTopics([...topics, created]);
      }
      setTopicForm({ title: '', icon: '', classNum: 3, description: '', color: '#38bdf8' });
    } catch (err) {
      alert('Error saving topic: ' + err.message);
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      icon: topic.icon,
      classNum: topic.classNum,
      description: topic.description,
      color: topic.color
    });
  };

  const handleDeleteTopic = async (id) => {
    if (!confirm('Are you sure you want to delete this topic? All questions under this topic will remain but be orphaned.')) return;
    try {
      await deleteTopic(id);
      setTopics(topics.filter((t) => t.$id !== id));
      if (selectedTopicId === id && topics.length > 1) {
        setSelectedTopicId(topics[0].$id);
      }
    } catch (err) {
      alert('Error deleting topic: ' + err.message);
    }
  };

  // Handle Question Form Actions
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const data = {
      ...questionForm,
      topicId: selectedTopicId,
      classNum: parseInt(questionForm.classNum),
      difficulty: parseInt(questionForm.difficulty)
    };
    try {
      if (editingQuestion) {
        const updated = await updateQuestion(editingQuestion.$id, data);
        setQuestions(questions.map((q) => (q.$id === editingQuestion.$id ? updated : q)));
        setEditingQuestion(null);
      } else {
        const created = await createQuestion(data);
        setQuestions([...questions, created]);
      }
      setQuestionForm({
        topicId: selectedTopicId,
        classNum: 3,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        difficulty: 2
      });
    } catch (err) {
      alert('Error saving question: ' + err.message);
    }
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      topicId: q.topicId,
      classNum: q.classNum,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty
    });
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.$id !== id));
    } catch (err) {
      alert('Error deleting question: ' + err.message);
    }
  };

  // 🤖 AI Question Generation Real API Integration
  const handleAIGenerate = async () => {
    setAiGenerating(true);
    setGeneratedQuestions([]);
    setSaveAllProgress(null);

    const activeTopic = topics.find(t => t.$id === selectedTopicId || t.id === selectedTopicId);
    if (!activeTopic) {
      alert('Please select a valid topic first.');
      setAiGenerating(false);
      return;
    }

    const activeSubtopics = activeTopic.subtopics || [];
    const activeSubtopic = activeSubtopics.find(s => s.$id === selectedSubtopicId || s.id === selectedSubtopicId);
    if (!activeSubtopic) {
      alert('Please select a valid subtopic first.');
      setAiGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopicId,
          subtopicId: selectedSubtopicId,
          topicTitle: activeTopic.title,
          subtopicTitle: activeSubtopic.title,
          classNum: activeTopic.classNum,
          count: aiCount,
          provider: aiProvider
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setGeneratedQuestions(data.questions);
    } catch (err) {
      console.error('Failed generating questions:', err);
      alert('❌ AI Generation failed: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // Bulk Save AI Generated Questions into Appwrite Database
  const handleBulkSaveAI = async () => {
    setSaveAllProgress('saving');
    let savedCount = 0;
    let skippedCount = 0;
    try {
      const selectedQuestions = generatedQuestions.filter((_, idx) => selectedQuestionsIndices.includes(idx));
      
      if (selectedQuestions.length === 0) {
        alert('Please select at least one question to save.');
        setSaveAllProgress(null);
        return;
      }

      for (const q of selectedQuestions) {
        const res = await createQuestion(q);
        if (res.alreadyExisted) {
          skippedCount++;
        } else {
          savedCount++;
        }
      }
      // Re-fetch questions list
      const qList = await getQuestionsByTopic(selectedTopicId);
      setQuestions(qList);

      // Re-fetch subtopic questions to refresh duplicate checkers
      if (selectedSubtopicId) {
        const subtopicQs = await getQuestionsByTopic(selectedSubtopicId);
        setExistingQuestionsInSubtopic(subtopicQs);
      }

      setGeneratedQuestions([]);
      setSaveAllProgress('done');
      
      let message = `🎉 Success! Created ${savedCount} new questions.`;
      if (skippedCount > 0) {
        message += ` Skipped ${skippedCount} duplicate question(s) that already existed.`;
      }
      alert(message);
    } catch (err) {
      console.error('Failed bulk saving questions:', err);
      setSaveAllProgress('error');
      alert('Failed saving questions: ' + err.message);
    }
  };

  // Subtopics CRUD handlers
  const handleSaveSubtopic = async (e, topicId) => {
    e.preventDefault();
    setSavingSubtopic(true);
    try {
      if (editingSubtopic) {
        const updated = await updateSubtopic(editingSubtopic.$id, subtopicForm);
        setTopics(topics.map(t => {
          if (t.$id === topicId) {
            return {
              ...t,
              subtopics: t.subtopics.map(s => s.$id === editingSubtopic.$id ? updated : s)
            };
          }
          return t;
        }));
        setEditingSubtopic(null);
      } else {
        const created = await createSubtopic({ ...subtopicForm, topicId });
        setTopics(topics.map(t => {
          if (t.$id === topicId) {
            return {
              ...t,
              subtopics: [...(t.subtopics || []), created]
            };
          }
          return t;
        }));
      }
      setSubtopicForm({ title: '', description: '', order: (topics.find(t => t.$id === topicId)?.subtopics?.length || 0) + 1 });
    } catch (err) {
      alert('Error saving subtopic: ' + err.message);
    } finally {
      setSavingSubtopic(false);
    }
  };

  const handleEditSubtopic = (sub) => {
    setEditingSubtopic(sub);
    setSubtopicForm({
      title: sub.title,
      description: sub.description,
      order: sub.order
    });
  };

  const handleDeleteSubtopic = async (topicId, subtopicId) => {
    if (!confirm('Are you sure you want to delete this subtopic? All questions under it will be deleted!')) return;
    try {
      await deleteSubtopic(subtopicId);
      setTopics(topics.map(t => {
        if (t.$id === topicId) {
          return {
            ...t,
            subtopics: t.subtopics.filter(s => s.$id !== subtopicId)
          };
        }
        return t;
      }));
    } catch (err) {
      alert('Error deleting subtopic: ' + err.message);
    }
  };

  // AI Syllabus Generation Handlers
  const handleAIGenerateSyllabus = async () => {
    if (!topicQuery) {
      alert('Please enter a topic idea first.');
      return;
    }
    setAiGenerating(true);
    setGeneratedSyllabus(null);
    try {
      const res = await fetch('/api/admin/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          topicQuery,
          classNum: classGradeSyllabus,
          provider: aiProvider,
          questionCount: questionsPerSubtopic
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate syllabus');
      }
      setGeneratedSyllabus(data.topicData);
    } catch (err) {
      console.error('Failed generating syllabus:', err);
      alert('❌ AI Generation failed: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApproveSyllabus = async () => {
    if (!generatedSyllabus) return;
    setSavingSyllabus(true);
    try {
      // Filter questions based on checkboxes
      const filteredSubtopics = generatedSyllabus.subtopics.map((sub, sIdx) => {
        const filteredQs = (sub.questions || []).filter((_, qIdx) => selectedSyllabusQuestions[`${sIdx}-${qIdx}`]);
        return {
          ...sub,
          questions: filteredQs
        };
      });

      const filteredSyllabus = {
        ...generatedSyllabus,
        subtopics: filteredSubtopics
      };

      const res = await fetch('/api/admin/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          topicData: filteredSyllabus
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save syllabus');
      }
      
      const updatedTopicsList = await getAllTopics();
      setTopics(updatedTopicsList);
      
      alert('🎉 Syllabus successfully saved and published! Students can now view this topic on the website.');
      setGeneratedSyllabus(null);
      setTopicQuery('');
      setActiveTab('topics');
    } catch (err) {
      console.error('Failed saving syllabus:', err);
      alert('❌ Failed to save syllabus: ' + err.message);
    } finally {
      setSavingSyllabus(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-300 pb-20" style={{ background: '#03050F' }}>
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5"
        style={{ background: 'rgba(3,5,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base bg-gradient-to-r from-red-500 to-orange-500">⚙️</div>
          <span className="font-display font-black text-lg text-white">Admin Console</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/topics" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
            Catalog
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Menu Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-4 mb-8 overflow-x-auto">
          {[
            { id: 'stats', label: '📊 System Stats' },
            { id: 'topics', label: '🗂️ Manage Topics & Chapters' },
            { id: 'questions', label: '📝 Manage Questions' },
            { id: 'ai_generator', label: '🧠 AI Content Generator' },
            { id: 'users', label: '👥 Student Directory' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-display font-bold text-xs px-5 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-body text-slate-500 text-xs">Accessing system files...</p>
          </div>
        ) : (
          <div>
            {/* ────────── STATS TAB ────────── */}
            {activeTab === 'stats' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="sci-card p-6 bg-slate-900/50">
                    <div className="text-slate-500 font-body text-xs">Total Students</div>
                    <div className="font-display font-black text-2xl text-white mt-1">{users.length}</div>
                  </div>
                  <div className="sci-card p-6 bg-slate-900/50">
                    <div className="text-slate-500 font-body text-xs">Total Topics</div>
                    <div className="font-display font-black text-2xl text-white mt-1">{topics.length}</div>
                  </div>
                  <div className="sci-card p-6 bg-slate-900/50">
                    <div className="text-slate-500 font-body text-xs">Active Questions</div>
                    <div className="font-display font-black text-2xl text-white mt-1">{questions.length}</div>
                  </div>
                  <div className="sci-card p-6 bg-slate-900/50">
                    <div className="text-slate-500 font-body text-xs">Quizzes Played</div>
                    <div className="font-display font-black text-2xl text-white mt-1">{results.length}</div>
                  </div>
                </div>

                <h2 className="font-display font-bold text-white text-base mb-4">🏆 Recent Quiz Logs</h2>
                <div className="sci-card overflow-hidden">
                  <table className="w-full text-left font-body text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-500 border-b border-white/5">
                        <th className="p-4">Student ID</th>
                        <th className="p-4">Topic</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">XP Earned</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 10).map((r) => (
                        <tr key={r.$id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4 font-bold text-slate-400">{r.userId}</td>
                          <td className="p-4">{r.topicId}</td>
                          <td className="p-4 text-green-400 font-bold">{r.score}/{r.total}</td>
                          <td className="p-4 text-yellow-400 font-bold">+{r.xpEarned} XP</td>
                          <td className="p-4 text-slate-500">{new Date(r.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ────────── TOPICS TAB ────────── */}
            {activeTab === 'topics' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="sci-card p-6 bg-slate-900/50 h-fit">
                  <h3 className="font-display font-bold text-white text-sm mb-4">
                    {editingTopic ? '✏️ Edit Topic' : '🌱 Create New Topic'}
                  </h3>
                  <form onSubmit={handleSaveTopic} className="space-y-4 font-body text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1.5 font-bold">Topic Title</label>
                      <input
                        type="text"
                        required
                        value={topicForm.title}
                        onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        placeholder="e.g. Gravity and Space"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1.5 font-bold">Emoji Icon</label>
                        <input
                          type="text"
                          required
                          value={topicForm.icon}
                          onChange={(e) => setTopicForm({ ...topicForm, icon: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-center focus:outline-none"
                          placeholder="🪐"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1.5 font-bold">Class Grade</label>
                        <select
                          value={topicForm.classNum}
                          onChange={(e) => setTopicForm({ ...topicForm, classNum: parseInt(e.target.value) })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        >
                          <option value="3">Grade 3</option>
                          <option value="4">Grade 4</option>
                          <option value="5">Grade 5</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5 font-bold">Hex Color Code</label>
                      <input
                        type="text"
                        required
                        value={topicForm.color}
                        onChange={(e) => setTopicForm({ ...topicForm, color: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        placeholder="#38bdf8"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5 font-bold">Short Description</label>
                      <textarea
                        required
                        rows="3"
                        value={topicForm.description}
                        onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none resize-none"
                        placeholder="Explain topic in one easy sentence for kids..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 btn-primary py-2.5 rounded-xl text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        {editingTopic ? 'Save Changes' : 'Create Topic'}
                      </button>
                      {editingTopic && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTopic(null);
                            setTopicForm({ title: '', icon: '', classNum: 3, description: '', color: '#38bdf8' });
                          }}
                          className="btn-secondary px-4 py-2.5 rounded-xl text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-display font-bold text-white text-sm mb-4">Existing Topics ({topics.length})</h3>
                  {topics.map((t) => (
                    <div key={t.$id} className="sci-card p-4 flex flex-col gap-4" style={{ background: 'rgba(11,18,37,0.4)' }}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white/5" style={{ color: t.color }}>
                            {t.icon || '📚'}
                          </div>
                          <div>
                            <div className="font-display font-bold text-white text-sm">{t.title}</div>
                            <div className="font-body text-slate-500 text-xs mt-0.5">Grade {t.classNum} • {t.color}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (expandedTopicId === t.$id) {
                                setExpandedTopicId(null);
                              } else {
                                setExpandedTopicId(t.$id);
                                setEditingSubtopic(null);
                                setSubtopicForm({ title: '', description: '', order: (t.subtopics?.length || 0) + 1 });
                              }
                            }}
                            className="text-sky-400 hover:text-white font-body text-xs px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg"
                          >
                            Chapters ({t.subtopics?.length || 0})
                          </button>
                          <button onClick={() => handleEditTopic(t)} className="text-orange-400 hover:text-white font-body text-xs px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteTopic(t.$id)} className="text-red-400 hover:text-white font-body text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                            Delete
                          </button>
                        </div>
                      </div>

                      {expandedTopicId === t.$id && (
                        <div className="mt-2 pt-4 border-t border-white/5 space-y-4">
                          <h4 className="font-display font-bold text-white text-xs">📖 Chapters (Subtopics) for {t.title}</h4>
                          
                          {/* List of subtopics */}
                          {(!t.subtopics || t.subtopics.length === 0) ? (
                            <p className="font-body text-slate-500 text-[11px]">No subtopics created yet. Add one below!</p>
                          ) : (
                            <div className="space-y-2">
                              {t.subtopics.map((sub) => (
                                <div key={sub.$id} className="flex justify-between items-center bg-slate-950/30 border border-white/5 rounded-xl p-3">
                                  <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-display font-bold text-[10px] text-sky-400">Order {sub.order}</span>
                                      <span className="font-display font-bold text-white text-xs truncate">{sub.title}</span>
                                    </div>
                                    <p className="font-body text-slate-400 text-[10px] mt-0.5 truncate">{sub.description}</p>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleEditSubtopic(sub)}
                                      className="text-orange-400 hover:text-white font-body text-[10px] px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubtopic(t.$id, sub.$id)}
                                      className="text-red-400 hover:text-white font-body text-[10px] px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Subtopic Add/Edit Form */}
                          <form onSubmit={(e) => handleSaveSubtopic(e, t.$id)} className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3 font-body text-xs">
                            <span className="font-display font-bold text-[10px] text-orange-400 block font-bold">
                              {editingSubtopic ? '✏️ Edit Chapter' : '🌱 Add New Chapter'}
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  required
                                  value={subtopicForm.title}
                                  onChange={(e) => setSubtopicForm({ ...subtopicForm, title: e.target.value })}
                                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none text-[11px]"
                                  placeholder="Chapter Title"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  required
                                  value={subtopicForm.order}
                                  onChange={(e) => setSubtopicForm({ ...subtopicForm, order: parseInt(e.target.value) })}
                                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-center focus:outline-none text-[11px]"
                                  placeholder="Order"
                                />
                              </div>
                            </div>
                            <div>
                              <textarea
                                required
                                rows="2"
                                value={subtopicForm.description}
                                onChange={(e) => setSubtopicForm({ ...subtopicForm, description: e.target.value })}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none resize-none text-[11px]"
                                placeholder="Explain chapter content in one easy sentence..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={savingSubtopic}
                                className="flex-1 btn-primary py-2 rounded-lg text-white font-bold text-[11px]"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                              >
                                {savingSubtopic ? 'Saving...' : editingSubtopic ? 'Save Chapter' : 'Add Chapter'}
                              </button>
                              {editingSubtopic && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSubtopic(null);
                                    setSubtopicForm({ title: '', description: '', order: (t.subtopics?.length || 0) + 1 });
                                  }}
                                  className="btn-secondary px-3 py-2 rounded-lg text-white text-[11px]"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ────────── QUESTIONS TAB ────────── */}
            {activeTab === 'questions' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="sci-card p-6 bg-slate-900/50 h-fit">
                  <h3 className="font-display font-bold text-white text-sm mb-4">
                    {editingQuestion ? '✏️ Edit Question' : '🌱 Add New Question'}
                  </h3>

                  <div className="mb-4">
                    <label className="block text-slate-500 mb-1.5 font-body text-xs font-bold">Selected Target Topic</label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white font-body text-xs focus:outline-none"
                    >
                      {topics.map((t) => (
                        <option key={t.$id} value={t.$id}>
                          Grade {t.classNum} - {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <form onSubmit={handleSaveQuestion} className="space-y-4 font-body text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1.5 font-bold">Class Grade</label>
                        <select
                          value={questionForm.classNum}
                          onChange={(e) => setQuestionForm({ ...questionForm, classNum: parseInt(e.target.value) })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        >
                          <option value="3">Grade 3</option>
                          <option value="4">Grade 4</option>
                          <option value="5">Grade 5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1.5 font-bold">Difficulty (1-10)</label>
                        <select
                          value={questionForm.difficulty}
                          onChange={(e) => setQuestionForm({ ...questionForm, difficulty: parseInt(e.target.value) })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        >
                          {[...Array(10)].map((_, idx) => (
                            <option key={idx + 1} value={idx + 1}>Lvl {idx + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1.5 font-bold">Question Wording</label>
                      <textarea
                        required
                        rows="2"
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none resize-none"
                        placeholder="e.g. Which of the following is a living thing?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-500 font-bold mb-1">Answer Options</label>
                      {questionForm.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-bold text-slate-600">{['A', 'B', 'C', 'D'][idx]}</span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...questionForm.options];
                              newOpts[idx] = e.target.value;
                              setQuestionForm({ ...questionForm, options: newOpts });
                            }}
                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1.5 font-bold">Correct Option Index</label>
                      <select
                        value={questionForm.correctIndex}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctIndex: parseInt(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      >
                        <option value="0">A</option>
                        <option value="1">B</option>
                        <option value="2">C</option>
                        <option value="3">D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1.5 font-bold">Science explanation (Fun Fact)</label>
                      <textarea
                        required
                        rows="3"
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none resize-none"
                        placeholder="Tell students the cool science fact about the correct answer..."
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 btn-primary py-2.5 rounded-xl text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        {editingQuestion ? 'Save Changes' : 'Add Question'}
                      </button>
                      {editingQuestion && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestion(null);
                            setQuestionForm({
                              topicId: selectedTopicId,
                              classNum: 3,
                              question: '',
                              options: ['', '', '', ''],
                              correctIndex: 0,
                              explanation: '',
                              difficulty: 2
                            });
                          }}
                          className="btn-secondary px-4 py-2.5 rounded-xl text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-white text-sm">Questions In Selected Topic ({questions.length})</h3>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                      <p className="font-body text-slate-500 text-xs">No questions loaded for this topic. Add your first above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q) => (
                        <div key={q.$id} className="sci-card p-5 bg-slate-900/30 border-white/5">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <span className="font-display font-black text-xs text-orange-400">Class {q.classNum} • DIFFICULTY LEVEL {q.difficulty} / 10</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditQuestion(q)} className="text-orange-400 hover:text-white font-body text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteQuestion(q.$id)} className="text-red-400 hover:text-white font-body text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="font-display font-bold text-white text-xs md:text-sm mb-3 leading-snug">{q.question}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 font-body text-[11px]">
                            {q.options.map((opt, i) => {
                              const isCorrect = i === q.correctIndex;
                              return (
                                <div 
                                  key={i} 
                                  className={`p-2 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                    isCorrect 
                                      ? 'border-green-500/30 bg-green-500/5 text-green-400 font-bold' 
                                      : 'border-white/5 bg-slate-950/40 text-slate-200'
                                  }`}
                                >
                                  <span className={`font-bold uppercase ${isCorrect ? 'text-green-400' : 'text-slate-500'}`}>
                                    {['A', 'B', 'C', 'D'][i]})
                                  </span>
                                  <span>{opt}</span>
                                  {isCorrect && <span className="ml-auto text-green-400 font-bold">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                          <p className="font-body text-slate-400 text-[10px] md:text-xs leading-relaxed pt-2.5 border-t border-white/5">
                            💡 <span className="font-bold text-slate-500 uppercase tracking-wide">Fun Fact:</span> {q.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ────────── AI CONTENT GENERATOR TAB ────────── */}
            {activeTab === 'ai_generator' && (
              <div className="space-y-6">
                
                {/* AI sub tabs */}
                <div className="flex gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/5 w-fit">
                  <button
                    onClick={() => setAiTab('syllabus')}
                    className={`font-display font-bold text-xs px-5 py-2.5 rounded-lg transition-all ${
                      aiTab === 'syllabus'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    ✨ Syllabus Architect (Entire Topic)
                  </button>
                  <button
                    onClick={() => setAiTab('questions')}
                    className={`font-display font-bold text-xs px-5 py-2.5 rounded-lg transition-all ${
                      aiTab === 'questions'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    📝 Question Booster (Existing Chapters)
                  </button>
                </div>

                {aiTab === 'syllabus' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Syllabus config */}
                    <div className="sci-card p-6 bg-slate-900/50 h-fit relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-green-500/15 border border-green-500/30 text-green-400 font-display font-bold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-full">
                        Gen-AI (Online)
                      </div>
                      <h3 className="font-display font-bold text-white text-sm mb-4">✨ Syllabus Architect</h3>
                      
                      <div className="mb-4 font-body text-xs">
                        <label className="block text-slate-500 mb-1.5 font-bold">Topic Idea / Scientific Concept</label>
                        <input
                          type="text"
                          required
                          value={topicQuery}
                          onChange={(e) => setTopicQuery(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                          placeholder="e.g. Gravity and solar orbit"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 font-body text-xs">
                        <div>
                          <label className="block text-slate-500 mb-1.5 font-bold">Target Grade</label>
                          <select
                            value={classGradeSyllabus}
                            onChange={(e) => setClassGradeSyllabus(parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                          >
                            <option value="3">Grade 3</option>
                            <option value="4">Grade 4</option>
                            <option value="5">Grade 5</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1.5 font-bold">Questions / Chapter</label>
                          <select
                            value={questionsPerSubtopic}
                            onChange={(e) => setQuestionsPerSubtopic(parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                          >
                            <option value="2">2 MCQs</option>
                            <option value="3">3 MCQs</option>
                            <option value="4">4 MCQs</option>
                            <option value="5">5 MCQs</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-6 font-body text-xs">
                        <label className="block text-slate-500 mb-1.5 font-bold">AI Model Provider</label>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        >
                          <option value="groq">Groq Cloud (Llama 3.3 70B)</option>
                          <option value="openai">ChatGPT API (GPT-4o mini)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleAIGenerateSyllabus}
                        disabled={aiGenerating}
                        className="btn-primary w-full py-3.5 rounded-xl text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                      >
                        {aiGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Architecting Syllabus...
                          </>
                        ) : (
                          'Generate Full Syllabus 🚀'
                        )}
                      </button>
                    </div>

                    {/* Syllabus Previews */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-white text-sm">Syllabus Structure Preview</h3>
                        {generatedSyllabus && (
                          <button
                            onClick={handleApproveSyllabus}
                            disabled={savingSyllabus}
                            className="btn-primary px-5 py-2.5 rounded-xl text-white font-display font-bold text-xs flex items-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
                          >
                            {savingSyllabus ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              'Approve & Publish to Site ✓'
                            )}
                          </button>
                        )}
                      </div>

                      {generatedSyllabus ? (
                        <div className="space-y-4">
                          {/* Topic Summary Card */}
                          <div className="sci-card p-5 border-orange-500/30 relative overflow-hidden" style={{ background: 'rgba(11, 18, 37, 0.7)' }}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white/5" style={{ color: generatedSyllabus.color }}>
                                {generatedSyllabus.icon || '🔬'}
                              </div>
                              <div>
                                <span className="font-display font-black text-[10px] text-orange-400 uppercase tracking-widest block">Generated Topic (Grade {generatedSyllabus.classNum})</span>
                                <h2 className="font-display font-bold text-white text-base leading-snug">{generatedSyllabus.title}</h2>
                              </div>
                            </div>
                            <p className="font-body text-slate-300 text-xs leading-relaxed">{generatedSyllabus.description}</p>
                          </div>

                          {/* Subtopics lists */}
                          <div className="space-y-4">
                            {generatedSyllabus.subtopics.map((sub, sIdx) => (
                              <div key={sIdx} className="sci-card p-5 bg-slate-900/35 border-white/5">
                                <div className="border-b border-white/5 pb-3 mb-4">
                                  <span className="font-display font-bold text-[10px] text-sky-400 uppercase">Chapter {sIdx + 1}</span>
                                  <h3 className="font-display font-bold text-white text-sm mt-0.5">{sub.title}</h3>
                                  <p className="font-body text-slate-400 text-xs mt-1">{sub.description}</p>
                                </div>

                                <div className="space-y-3">
                                  {sub.questions?.map((q, qIdx) => {
                                    const key = `${sIdx}-${qIdx}`;
                                    const isChecked = !!selectedSyllabusQuestions[key];
                                    const isDuplicate = sub.questions.slice(0, qIdx).some(
                                      (prevQ) => prevQ.question.trim().toLowerCase() === q.question.trim().toLowerCase()
                                    );

                                    return (
                                      <div key={qIdx} className="bg-slate-950/40 p-4 rounded-xl border transition-all duration-200"
                                        style={{ 
                                          borderColor: isChecked ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.03)',
                                          opacity: isChecked ? 1 : 0.5 
                                        }}>
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => setSelectedSyllabusQuestions({
                                                ...selectedSyllabusQuestions,
                                                [key]: e.target.checked
                                              })}
                                              className="w-3.5 h-3.5 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="font-display font-black text-[9px] text-slate-500">QUESTION {qIdx + 1} • DIFFICULTY {q.difficulty}/10</span>
                                          </div>
                                          {isDuplicate && (
                                            <span className="bg-red-500/15 border border-red-500/30 text-red-400 font-display font-bold text-[8px] uppercase px-2 py-0.5 rounded-full animate-pulse">
                                              ⚠️ Duplicate
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-display font-bold text-white text-xs mb-3">{q.question}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 font-body text-[10px]">
                                          {q.options.map((opt, oIdx) => {
                                            const isCorrect = oIdx === q.correctIndex;
                                            return (
                                              <div 
                                                key={oIdx} 
                                                className={`p-2 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                                  isCorrect 
                                                    ? 'border-green-500/30 bg-green-500/5 text-green-400 font-bold' 
                                                    : 'border-white/5 bg-slate-950/40 text-slate-200'
                                                }`}
                                              >
                                                <span className={`font-bold uppercase ${isCorrect ? 'text-green-400' : 'text-slate-500'}`}>
                                                  {['A', 'B', 'C', 'D'][oIdx]})
                                                </span>
                                                <span>{opt}</span>
                                                {isCorrect && <span className="ml-auto text-green-400 font-bold">✓</span>}
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <p className="font-body text-slate-400 text-[10px] pt-2 border-t border-white/5">
                                          💡 <span className="font-bold text-slate-500">Fun Fact:</span> {q.explanation}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                          <div className="text-4xl mb-3">✨</div>
                          <p className="font-body text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                            No syllabus generated yet. Type a topic name, select options, and click **"Generate Full Syllabus"** to let AI build a curriculum!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Question booster config */}
                    <div className="sci-card p-6 bg-slate-900/50 h-fit relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-green-500/15 border border-green-500/30 text-green-400 font-display font-bold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-full">
                        Gen-AI (Online)
                      </div>
                      <h3 className="font-display font-bold text-white text-sm mb-4">🧠 Question Booster</h3>
                      
                      <div className="mb-4">
                        <label className="block text-slate-500 mb-1.5 font-body text-xs font-bold font-display">Target Topic to Seed</label>
                        <select
                          value={selectedTopicId}
                          onChange={(e) => setSelectedTopicId(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white font-body text-xs focus:outline-none"
                        >
                          {topics.map((t) => (
                            <option key={t.$id} value={t.$id}>
                              Grade {t.classNum} - {t.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-slate-500 mb-1.5 font-body text-xs font-bold font-display">Target Chapter / Subtopic</label>
                        <select
                          value={selectedSubtopicId}
                          onChange={(e) => setSelectedSubtopicId(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white font-body text-xs focus:outline-none"
                        >
                          {(topics.find(t => t.$id === selectedTopicId || t.id === selectedTopicId)?.subtopics || []).map((sub) => (
                            <option key={sub.$id} value={sub.$id}>
                              Order {sub.order} - {sub.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4 font-body text-xs">
                        <label className="block text-slate-500 mb-1.5 font-bold font-display">AI Provider</label>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                        >
                          <option value="groq">Groq Cloud (Llama 3.3 70B)</option>
                          <option value="openai">ChatGPT API (GPT-4o mini)</option>
                        </select>
                      </div>

                      <div className="mb-6 font-body text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-slate-500 font-bold">Quantity to Generate</label>
                          <span className="font-display font-bold text-orange-400">{aiCount} MCQs</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={aiCount}
                          onChange={(e) => setAiCount(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      <button
                        onClick={handleAIGenerate}
                        disabled={aiGenerating}
                        className="btn-primary w-full py-3.5 rounded-xl text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                      >
                        {aiGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI Boosting...
                          </>
                        ) : (
                          'Generate CBSE Questions with AI 🧠'
                        )}
                      </button>
                    </div>

                    {/* Question booster preview */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-white text-sm">AI Generated Previews ({generatedQuestions.length})</h3>
                        {generatedQuestions.length > 0 && (
                          <button
                            onClick={handleBulkSaveAI}
                            disabled={saveAllProgress === 'saving'}
                            className="btn-primary px-5 py-2.5 rounded-xl text-white font-display font-bold text-xs flex items-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
                          >
                            {saveAllProgress === 'saving' ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Committing...
                              </>
                            ) : (
                              'Approve & Save all in Bulk ✓'
                            )}
                          </button>
                        )}
                      </div>

                      {generatedQuestions.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                          <div className="text-4xl mb-3">🤖</div>
                          <p className="font-body text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                            No AI questions generated. Choose a target topic/chapter and click **"Generate CBSE Questions"** to trigger AI question booster!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-fade-in">
                          {generatedQuestions.map((q, idx) => {
                            const isChecked = selectedQuestionsIndices.includes(idx);
                            const isDuplicate = existingQuestionsInSubtopic.some(
                              (eq) => eq.question.trim().toLowerCase() === q.question.trim().toLowerCase()
                            );

                            return (
                              <div key={idx} className="sci-card p-5 bg-slate-900/40 relative overflow-hidden transition-all duration-200"
                                style={{ 
                                  borderColor: isChecked ? 'rgba(249, 115, 22, 0.3)' : 'rgba(255,255,255,0.06)',
                                  opacity: isChecked ? 1 : 0.5 
                                }}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedQuestionsIndices([...selectedQuestionsIndices, idx]);
                                        } else {
                                          setSelectedQuestionsIndices(selectedQuestionsIndices.filter(i => i !== idx));
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="font-display font-black text-[10px] text-orange-400">Class {q.classNum} • DIFFICULTY: LEVEL {q.difficulty} / 10</span>
                                  </div>
                                  {isDuplicate && (
                                    <span className="bg-red-500/15 border border-red-500/30 text-red-400 font-display font-bold text-[8px] uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                                      ⚠️ Already on Site
                                    </span>
                                  )}
                                </div>
                                <p className="font-display font-bold text-white text-xs md:text-sm mb-3">{q.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 font-body text-[11px]">
                                  {q.options.map((opt, i) => {
                                    const isCorrect = i === q.correctIndex;
                                    return (
                                      <div 
                                        key={i} 
                                        className={`p-2 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                          isCorrect 
                                            ? 'border-green-500/30 bg-green-500/5 text-green-400 font-bold' 
                                            : 'border-white/5 bg-slate-950/40 text-slate-200'
                                        }`}
                                      >
                                        <span className={`font-bold uppercase ${isCorrect ? 'text-green-400' : 'text-slate-500'}`}>
                                          {['A', 'B', 'C', 'D'][i]})
                                        </span>
                                        <span>{opt}</span>
                                        {isCorrect && <span className="ml-auto text-green-400 font-bold">✓</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="font-body text-slate-400 text-[10px] md:text-xs leading-relaxed pt-2.5 border-t border-white/5">
                                  💡 <span className="font-bold text-slate-500 uppercase">AI Explanation:</span> {q.explanation}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ────────── USERS DIRECTORY TAB ────────── */}
            {activeTab === 'users' && (
              <div>
                <h3 className="font-display font-bold text-white text-sm mb-4">Student Profile Registry ({users.length})</h3>
                <div className="sci-card overflow-hidden">
                  <table className="w-full text-left font-body text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-500 border-b border-white/5">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Class</th>
                        <th className="p-4">Belt Level</th>
                        <th className="p-4">Streak</th>
                        <th className="p-4">Total XP</th>
                        <th className="p-4">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.$id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4 font-bold text-slate-300">{u.name}</td>
                          <td className="p-4 text-slate-500">{u.email}</td>
                          <td className="p-4 font-bold">Grade {u.classNum}</td>
                          <td className="p-4 uppercase tracking-wider font-bold"
                            style={{
                              color: u.beltLevel === 'white' ? '#fff' :
                                     u.beltLevel === 'yellow' ? '#facc15' :
                                     u.beltLevel === 'green' ? '#4ade80' :
                                     u.beltLevel === 'blue' ? '#38bdf8' :
                                     u.beltLevel === 'red' ? '#f87171' : '#c084fc'
                            }}>
                            🥋 {u.beltLevel}
                          </td>
                          <td className="p-4 text-orange-400 font-bold">🔥 {u.streak} days</td>
                          <td className="p-4 text-yellow-400 font-bold">{u.xp} XP</td>
                          <td className="p-4 text-slate-500">{new Date(u.lastActive).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
