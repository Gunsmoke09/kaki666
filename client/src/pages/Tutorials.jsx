import { useState, useEffect } from 'react';
import { Loader, Pagination, Button, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import TutorialList from '../components/Tutorial/TutorialList';
import TutorialForm from '../components/Tutorial/TutorialForm';
import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [paginationLinks, setPaginationLinks] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorials = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(buildApiUrl(`/tutorials?page=${page}&limit=10`));

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        setTutorials(data);

        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
          const links = {};
          linkHeader.split(',').forEach((link) => {
            const match = link.match(/<([^>]+)>; rel="([^"]+)"/);
            if (match) {
              const url = match[1];
              const rel = match[2];
              links[rel] = url;
            }
          });
          setPaginationLinks(links);
        } else {
          setPaginationLinks({});
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch tutorials');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [page]);

  const createTutorial = async (tutorialData) => {
    const token = getAuthToken();

    if (!token) {
      navigate('/login');
      return false;
    }

    setError('');

    try {
      const response = await fetch(buildApiUrl('/tutorials'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...tutorialData }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Failed to create tutorial');
      }

      setTutorials((prev) => [body, ...prev]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create tutorial');
      return false;
    }
  };

  return (
    <>
      <h2>Tutorials</h2>

      {error ? <Alert color="red" mb="md">{error}</Alert> : null}

      <Button onClick={() => setModalOpen(true)}>New Tutorial</Button>

      <TutorialForm
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={createTutorial}
        action="New"
      />

      <Pagination
        value={page}
        onChange={(newPage) => {
          setPage(newPage);
        }}
        total={
          paginationLinks.last
            ? parseInt(paginationLinks.last.match(/page=(\d+)/)[1], 10)
            : 1
        }
        nextButtonDisabled={!paginationLinks.next}
        prevButtonDisabled={!paginationLinks.previous}
        radius="xl"
        h="xl"
      />

      {loading ? (
        <Loader />
      ) : (
        <TutorialList tutorials={tutorials} setTutorials={setTutorials} />
      )}
    </>
  );
};

export default Tutorials;
