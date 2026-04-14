// MaterialForm.js
import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group } from '@mantine/core';

const MaterialForm = ({ opened, onClose, isUpdateMode, selectedMaterial, onCreate, onUpdate }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isUpdateMode && selectedMaterial) {
      setName(selectedMaterial.name);
    }
  }, [isUpdateMode, selectedMaterial]);

  const handleSubmit = () => {
    const materialData = { name };
    if (isUpdateMode) {
      onUpdate(materialData);
    } else {
      onCreate(materialData);
    }
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isUpdateMode ? 'Update Material' : 'Create Material'}>
      <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Group position="right" mt="md">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{isUpdateMode ? 'Update' : 'Create'}</Button>
      </Group>
    </Modal>
  );
};

export default MaterialForm;
