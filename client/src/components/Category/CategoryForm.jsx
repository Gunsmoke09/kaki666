import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group } from '@mantine/core';

function CategoryForm({
  opened,
  onClose,
  isUpdateMode,
  selectedCategory,
  onCreate,
  onUpdate,
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!opened) return;

    if (isUpdateMode && selectedCategory) {
      setName(selectedCategory.name || '');
    } else {
      setName('');
    }
  }, [opened, isUpdateMode, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryData = {
      name: name.trim(),
    };

    if (!categoryData.name) return;

    if (isUpdateMode) {
      await onUpdate(categoryData);
    } else {
      await onCreate(categoryData);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isUpdateMode ? 'Edit Category' : 'Create Category'}
      centered
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Category Name"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Group justify="right" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isUpdateMode ? 'Update' : 'Create'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export default CategoryForm;