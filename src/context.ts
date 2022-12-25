import { createContext, RefObject } from 'react';

import Alerts from '../components/alerts';

type ContextType = {
  signedIn?: boolean | null;
  setSignedIn?: (signedIn: boolean | null) => void;
  alertsRef?: RefObject<Alerts>;
};

const Context = createContext<ContextType>({});

export default Context;
