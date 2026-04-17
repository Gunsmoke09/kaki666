import { useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Button, Group, Alert, Stack } from '@mantine/core';

function CategoryForm({ opened, onClose, isUpdateMode, selectedCategory, onCreate, onUpdate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!opened) return;

    if (isUpdateMode && selectedCategory) {
      setName(selectedCategory.name || '');
      setDescription(selectedCategory.description || '');
    } else {
      setName('');
      setDescription('');
    }

    setFormError('');
  }, [opened, isUpdateMode, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryData = { name: name.trim(), description: description.trim() };
    if (!categoryData.name) {
      setFormError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      if (isUpdateMode) {
        await onUpdate(categoryData);
      } else {
        await onCreate(categoryData);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isUpdateMode ? 'Edit Category' : 'Create Category'} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          {formError ? <Alert color="red" mb="sm">{formError}</Alert> : null}

          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description (optional)"
            placeholder="Add a category description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
          />

          <Group justify="right" mt="md">
            <Button type="button" variant="default" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>{isUpdateMode ? 'Update' : 'Create'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default CategoryForm;
