import { LangProvider } from './LangContext';
import Survey from './Survey';

export default function App() {
  return (
    <LangProvider>
      <Survey />
    </LangProvider>
  );
}
