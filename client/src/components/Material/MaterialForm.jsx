import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group } from '@mantine/core';

const MaterialForm = ({ opened, onClose, isUpdateMode, selectedMaterial, onCreate, onUpdate }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (isUpdateMode && selectedMaterial) {
      setName(selectedMaterial.name);
    } else {
      setName('');
    }
  }, [opened, isUpdateMode, selectedMaterial]);

  const handleSubmit = async () => {
    const materialData = { name: name.trim() };
    if (!materialData.name) {
      return;
    }

    setSubmitting(true);

    const success = isUpdateMode
      ? await onUpdate(materialData)
      : await onCreate(materialData);

    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isUpdateMode ? 'Update Material' : 'Create Material'}>
      <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Group justify="right" mt="md">
        <Button variant="default" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting}>{isUpdateMode ? 'Update' : 'Create'}</Button>
      </Group>
    </Modal>
  );
};

export default MaterialForm;
