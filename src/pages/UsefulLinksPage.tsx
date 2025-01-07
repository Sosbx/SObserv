import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Link as LinkIcon, 
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  X,
  Save,
  Settings
} from 'lucide-react';
import { useUsefulLinksStore, UsefulLink } from '../store/usefulLinksStore';
import { useAuthStore } from '../store/authStore';

// ... [Keep existing interfaces and LinkModal component] ...

const UsefulLinksPage: React.FC = () => {
  const { user } = useAuthStore();
  const { links, loadLinks, addLink, updateLink, deleteLink, reorderLinks } = useUsefulLinksStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<UsefulLink | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadLinks();
    return () => {
      useUsefulLinksStore.getState().cleanup();
    };
  }, [loadLinks]);

  const handleLinkClick = (link: UsefulLink, e: React.MouseEvent) => {
    if (isEditMode) return;
    
    const target = e.target as HTMLElement;
    const clickedContent = target.closest('.link-content');
    
    if (clickedContent) {
      window.open(link.url, '_blank');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !user) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedLinks = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    reorderLinks(reorderedLinks);
  };

  const handleDelete = async (e: React.MouseEvent, link: UsefulLink) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      if (link.isSystem) {
        // For system links, we just hide them using the override mechanism
        await updateLink(link.id, { hidden: true });
      } else {
        await deleteLink(link.id);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, link: UsefulLink) => {
    e.stopPropagation();
    setEditingLink(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Liens utiles</h1>
        </div>
        {user && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isEditMode 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isEditMode ? 'Terminer l\'édition' : 'Modifier les liens'}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isEditMode ? 'Terminer' : 'Modifier'}
              </span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm"
              title="Ajouter un lien"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouveau lien</span>
            </button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="links">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4"
            >
              {links.map((link, index) => (
                <Draggable 
                  key={link.id} 
                  draggableId={link.id} 
                  index={index}
                  isDragDisabled={!user}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`w-full p-4 sm:p-6 bg-white rounded-lg shadow-md transition-all ${
                        !isEditMode && 'hover:shadow-lg cursor-pointer'
                      } ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500 ring-opacity-50' : ''}`}
                      onClick={(e) => handleLinkClick(link, e)}
                    >
                      <div className="flex items-center gap-4">
                        {user && (
                          <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 link-content">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{link.title}</h3>
                          <p className="text-sm sm:text-base text-gray-600">{link.description}</p>
                        </div>
                        {user && isEditMode && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={(e) => handleEdit(e, link)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                              title="Modifier"
                            >
                              <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, link)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showAddModal && (
        <LinkModal
          title="Ajouter un lien"
          onClose={() => setShowAddModal(false)}
          onSave={addLink}
        />
      )}

      {editingLink && (
        <LinkModal
          title="Modifier le lien"
          onClose={() => setEditingLink(null)}
          onSave={(data) => updateLink(editingLink.id, data)}
          initialData={editingLink}
        />
      )}
    </div>
  );
};

export default UsefulLinksPage;