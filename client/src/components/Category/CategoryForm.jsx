import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group, Alert } from '@mantine/core';

function CategoryForm({ opened, onClose, isUpdateMode, selectedCategory, onCreate, onUpdate }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!opened) return;

    if (isUpdateMode && selectedCategory) {
      setName(selectedCategory.name || '');
    } else {
      setName('');
    }

    setFormError('');
  }, [opened, isUpdateMode, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryData = { name: name.trim() };
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
        {formError ? <Alert color="red" mb="sm">{formError}</Alert> : null}

        <TextInput
          label="Category Name"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Group justify="right" mt="md">
          <Button type="button" variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>{isUpdateMode ? 'Update' : 'Create'}</Button>
        </Group>
      </form>
    </Modal>
  );
}

export default CategoryForm;
