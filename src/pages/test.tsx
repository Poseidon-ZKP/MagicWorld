import React, { useContext } from "react";
import Button from "../components/Button";
import { ZKShuffleContext } from "../contexts/ZKShuffle";

function Test() {
  const { clearCache } = useContext(ZKShuffleContext);
  return (
    <Button
      onClick={() => {
        clearCache();
      }}
    >
      clear cache
    </Button>
  );
}

export default Test;
