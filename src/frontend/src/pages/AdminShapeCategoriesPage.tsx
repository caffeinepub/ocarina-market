import { useState } from 'react';
import { useIsCallerAdmin, useGetShapeCategories, useAddShapeCategory, useRenameShapeCategory } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, Edit2, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminShapeCategoriesPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: categories, isLoading: categoriesLoading } = useGetShapeCategories();
  const addCategory = useAddShapeCategory();
  const renameCategory = useRenameShapeCategory();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState<{ oldName: string; newName: string } | null>(null);

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      await addCategory.mutateAsync(trimmedName);
      toast.success(`Category "${trimmedName}" added successfully`);
      setNewCategoryName('');
    } catch (error: any) {
      console.error('Add category error:', error);
      toast.error(error.message || 'Failed to add category');
    }
  };

  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setEditedName(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedName('');
  };

  const handleSaveEdit = () => {
    const trimmedName = editedName.trim();
    if (!trimmedName) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (trimmedName === editingCategory) {
      handleCancelEdit();
      return;
    }

    setCategoryToRename({ oldName: editingCategory!, newName: trimmedName });
    setShowRenameConfirm(true);
  };

  const handleConfirmRename = async () => {
    if (!categoryToRename) return;

    try {
      await renameCategory.mutateAsync(categoryToRename);
      toast.success(`Category renamed to "${categoryToRename.newName}"`);
      setEditingCategory(null);
      setEditedName('');
      setCategoryToRename(null);
      setShowRenameConfirm(false);
    } catch (error: any) {
      console.error('Rename category error:', error);
      toast.error(error.message || 'Failed to rename category');
      setShowRenameConfirm(false);
    }
  };

  if (adminLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Tag className="h-8 w-8" />
          Manage Shape Subcategories
        </h1>
        <p className="text-muted-foreground">
          Add and edit shape subcategories for your ocarina items
        </p>
      </div>

      <div className="grid gap-6">
        {/* Add New Category Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Subcategory
            </CardTitle>
            <CardDescription>
              Create a new shape subcategory that will appear in bulk upload and item editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="new-category" className="sr-only">
                  New Category Name
                </Label>
                <Input
                  id="new-category"
                  placeholder="Enter subcategory name (e.g., Pendant, Inline)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleAddCategory}
                disabled={addCategory.isPending || !newCategoryName.trim()}
              >
                {addCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Categories Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Existing Subcategories
            </CardTitle>
            <CardDescription>
              Click edit to rename a subcategory. All items using this subcategory will be updated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!categories || categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No shape subcategories yet. Add your first one above.
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30"
                  >
                    {editingCategory === category ? (
                      <>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={renameCategory.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={renameCategory.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{category}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(category)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rename Confirmation Dialog */}
      <AlertDialog open={showRenameConfirm} onOpenChange={setShowRenameConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rename</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rename "{categoryToRename?.oldName}" to "{categoryToRename?.newName}"?
              <br />
              <br />
              All items currently using this subcategory will be updated automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRenameConfirm(false);
              setCategoryToRename(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRename} disabled={renameCategory.isPending}>
              {renameCategory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Confirm Rename'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
