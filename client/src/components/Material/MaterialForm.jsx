import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group, Alert } from '@mantine/core';

const MaterialForm = ({ opened, onClose, isUpdateMode, selectedMaterial, onCreate, onUpdate }) => {
  const [name, setName] = useState('');
  const [purchaseSource, setPurchaseSource] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (isUpdateMode && selectedMaterial) {
      setName(selectedMaterial.name || '');
      setPurchaseSource(selectedMaterial.purchaseSource || '');
    } else {
      setName('');
      setPurchaseSource('');
    }

    setFormError('');
  }, [opened, isUpdateMode, selectedMaterial]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const materialData = { name: name.trim(), purchaseSource: purchaseSource.trim() };
    if (!materialData.name) {
      setFormError('Material name is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      if (isUpdateMode) {
        await onUpdate(materialData);
      } else {
        await onCreate(materialData);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isUpdateMode ? 'Update Material' : 'Create Material'}>
      <form onSubmit={handleSubmit}>
        {formError ? <Alert color="red" mb="sm">{formError}</Alert> : null}
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextInput label="Purchase Source" value={purchaseSource} onChange={(e) => setPurchaseSource(e.target.value)} mt="sm" />
        <Group justify="right" mt="md">
          <Button type="button" variant="default" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" loading={submitting}>{isUpdateMode ? 'Update' : 'Create'}</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default MaterialForm;
