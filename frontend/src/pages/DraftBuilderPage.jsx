// import { useEffect, useState } from 'react';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import { Plus, GripVertical, Trash2, Save } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../utils/api';
// import SessionGuard from '../components/SessionGuard';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Select from '../components/ui/Select';
// import LoadingSpinner from '../components/ui/LoadingSpinner';
// import { FIELD_TYPES } from '../utils/helpers';

// export default function DraftBuilderPage() {
//   const [fields, setFields] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     api.get('/templates')
//       .then(({ data }) => setFields(data.data.fields || []))
//       .catch(() => toast.error('Failed to load template'))
//       .finally(() => setLoading(false));
//   }, []);

//   const addField = () => {
//     const key = `field_${Date.now()}`;
//     setFields([
//       ...fields,
//       { key, label: 'New Field', type: 'text', required: false, order: fields.length, options: [] },
//     ]);
//   };

//   const updateField = (index, updates) => {
//     const updated = [...fields];
//     updated[index] = { ...updated[index], ...updates };
//     if (updates.label) {
//       updated[index].key = updates.label.toLowerCase().replace(/\s+/g, '_');
//     }
//     setFields(updated);
//   };

//   const removeField = (index) => {
//     setFields(fields.filter((_, i) => i !== index));
//   };

//   const onDragEnd = (result) => {
//     if (!result.destination) return;
//     const items = Array.from(fields);
//     const [removed] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, removed);
//     setFields(items.map((f, i) => ({ ...f, order: i })));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       await api.put('/templates', { fields });
//       toast.success('Form template saved');
//     } catch {
//       toast.error('Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <SessionGuard>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Draft Builder</h1>
//             <p className="text-gray-500">Design dynamic student information forms</p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="secondary" onClick={addField}><Plus size={16} /> Add Field</Button>
//             <Button onClick={handleSave} loading={saving}><Save size={16} /> Save Template</Button>
//           </div>
//         </div>

//         <Card>
//           <DragDropContext onDragEnd={onDragEnd}>
//             <Droppable droppableId="fields">
//               {(provided) => (
//                 <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
//                   {fields.map((field, index) => (
//                     <Draggable key={field.key || index} draggableId={field.key || String(index)} index={index}>
//                       {(prov) => (
//                         <div
//                           ref={prov.innerRef}
//                           {...prov.draggableProps}
//                           className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
//                         >
//                           <div {...prov.dragHandleProps} className="pt-2 cursor-grab">
//                             <GripVertical size={18} className="text-gray-400" />
//                           </div>
//                           <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
//                             <Input
//                               label="Label"
//                               value={field.label}
//                               onChange={(e) => updateField(index, { label: e.target.value })}
//                             />
//                             <Select
//                               label="Type"
//                               value={field.type}
//                               onChange={(e) => updateField(index, { type: e.target.value })}
//                               options={[{ value: '', label: 'Select type' }, ...FIELD_TYPES]}
//                             />
//                             <label className="flex items-center gap-2 pt-6">
//                               <input
//                                 type="checkbox"
//                                 checked={field.required}
//                                 onChange={(e) => updateField(index, { required: e.target.checked })}
//                                 className="rounded"
//                               />
//                               <span className="text-sm">Required</span>
//                             </label>
//                             {field.type === 'dropdown' && (
//                               <Input
//                                 label="Options (comma separated)"
//                                 value={(field.options || []).join(', ')}
//                                 onChange={(e) =>
//                                   updateField(index, {
//                                     options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
//                                   })
//                                 }
//                               />
//                             )}
//                           </div>
//                           <button onClick={() => removeField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>
//         </Card>
//       </div>
//     </SessionGuard>
//   );
// }

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FIELD_TYPES } from '../utils/helpers';

export default function DraftBuilderPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/templates')
      .then(({ data }) => setFields(data.data.fields || []))
      .catch(() => toast.error('Failed to load template'))
      .finally(() => setLoading(false));
  }, []);

  const addField = () => {
    const key = `field_${Date.now()}`;
    setFields([
      ...fields,
      { key, label: 'New Field', type: 'text', required: false, order: fields.length, options: [] },
    ]);
  };

  const updateField = (index, updates) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    if (updates.label) {
      updated[index].key = updates.label.toLowerCase().replace(/\s+/g, '_');
    }
    setFields(updated);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setFields(items.map((f, i) => ({ ...f, order: i })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/templates', { fields });
      toast.success('Form template saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Draft Builder</h1>
            <p className="text-gray-500">Design dynamic student information forms</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={addField}><Plus size={16} /> Add Field</Button>
            <Button onClick={handleSave} loading={saving}><Save size={16} /> Save Template</Button>
          </div>
        </div>

        <Card>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {fields.map((field, index) => (
                    <Draggable key={field.key || index} draggableId={field.key || String(index)} index={index}>
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div {...prov.dragHandleProps} className="pt-2 cursor-grab">
                            <GripVertical size={18} className="text-gray-400" />
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input
                              label="Label"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                            />
                            <Select
                              label="Type"
                              value={field.type}
                              onChange={(e) => updateField(index, { type: e.target.value })}
                              options={[{ value: '', label: 'Select type' }, ...FIELD_TYPES]}
                            />
                            <label className="flex items-center gap-2 pt-6">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm">Required</span>
                            </label>
                            {field.type === 'dropdown' && (
                              <Input
                                label="Options (comma separated)"
                                value={(field.options || []).join(', ')}
                                onChange={(e) =>
                                  updateField(index, {
                                    options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                                  })
                                }
                              />
                            )}
                          </div>
                          <button onClick={() => removeField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      </div>
    </SessionGuard>
  );
}
