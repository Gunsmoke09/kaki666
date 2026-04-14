import { useState, useEffect } from 'react';
import { Loader, Pagination, Button } from '@mantine/core';
import TutorialList from '../components/Tutorial/TutorialList';
import TutorialForm from '../components/Tutorial/TutorialForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationLinks, setPaginationLinks] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTutorials = async () => {
      setLoading(true);

      const token = localStorage.getItem('jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/tutorials?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [page]);

  const createTutorial = async (tutorialData) => {
    const token = localStorage.getItem('jwt');

    try {
      const response = await fetch(`${API_BASE_URL}/tutorials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...tutorialData }),
      });

      if (!response.ok) throw new Error('Failed to create tutorial');

      const createdTutorial = await response.json();

      setTutorials((prev) => [createdTutorial, ...prev]);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h2>Tutorials</h2>

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