import React, { useContext } from 'react';
import Button from '../components/Button';
import { ZKShuffleContext } from '../contexts/ZKShuffle';

function Index() {
  const { clearCache } = useContext(ZKShuffleContext);
  return (
    <Button
      onClick={() => {
        clearCache();
      }}
    >
      {' '}
      clear zk shuffle files{' '}
    </Button>
  );
}

export default Index;
