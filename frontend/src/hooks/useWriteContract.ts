import { useState } from 'react';

interface Option<Params> {
  args?: Params[];
  wait?: boolean;
}

function useWriteContract<Params = any, Response = any>(
  method: ((...args: Params[]) => Promise<Response>) | any,
  { args = [], wait = true }: Option<Params>
) {
  const [result, setResult] = useState<Response>();
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reset = () => {
    setResult(undefined);
    setIsError(false);
    setIsSuccess(false);
    setIsLoading(false);
  };

  const callMethod = async (...fnArgs: any[]) => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    // console.log('fnArgs', fnArgs);

    try {
      let res: any = await method(...[...args, ...fnArgs]);
      wait && res?.wait && (res = await res?.wait());
      setResult(res);
      setIsSuccess(true);
    } catch (e) {
      console.log('error', e);
      setIsError(true);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    run: callMethod,
    data: result,
    isSuccess,
    isError,
    isLoading,
    setIsLoading,
    setIsSuccess,
    setIsError,
    reset,
  };
}

export default useWriteContract;
