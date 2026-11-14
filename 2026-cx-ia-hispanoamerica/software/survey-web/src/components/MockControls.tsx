import {useMemo,useState,type ReactNode} from 'react';
import {Settings2} from 'lucide-react';
import {Dialog} from './ui/Dialog';
import {Button} from './ui/Button';
import {Select} from './ui/Select';
import {configureMock,readDatabase} from '../mocks/database';
import {initialDatabase,type MockDatabase} from '../mocks/model';
import {useSurveyStore} from '../store/surveyStore';
import {API_UI} from '../data/apiUi';
export const MockControls=():ReactNode=>{
 const [open,setOpen]=useState(false);const [error,setError]=useState('');const [revision,setRevision]=useState(0);
 const {locale,status,loadStatus}=useSurveyStore();const t=API_UI[locale];
 const db=useMemo(()=>{try{return readDatabase();}catch{return initialDatabase;}},[open,revision,status]);
 if(import.meta.env.VITE_USE_MOCK_API==='false')return null;
 const apply=async(values:Partial<Omit<MockDatabase,'records'>>):Promise<void>=>{
  try{configureMock(values);setError('');setRevision(n=>n+1);setOpen(false);useSurveyStore.setState({submitted:null,duplicate:null,verificationMessage:''});await loadStatus();}
  catch{setError(t.mockErrorSave);}
 };
 return <Dialog open={open} onOpenChange={setOpen}>
  <Button variant="tertiary" aria-label={t.mockTitle} onClick={()=>setOpen(true)} className="min-h-11 text-indigo-800"><Settings2 className="size-4" aria-hidden="true"/><span className="hidden lg:inline">{t.mockTitle}</span></Button>
  <Dialog.Content className="max-w-lg h-auto"><Dialog.Header><Dialog.TitleRow><Dialog.Title>{t.mockTitle}</Dialog.Title><Dialog.Close ariaLabel={t.mockClose}/></Dialog.TitleRow></Dialog.Header>
   <Dialog.Body className="space-y-5"><Dialog.Description className="text-sm leading-6">{t.mockDescription}</Dialog.Description>
    <p className="text-sm font-medium">{t.mockCount}: <span className="tabular-nums">{status?.completed??db.completed}</span></p>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
     <Button variant="secondary" onClick={()=>void apply({phase:'pilot',completed:0,manualPaused:false,failStatus:false})}>{t.mockOpen}</Button>
     <Button variant="secondary" onClick={()=>void apply({phase:'pilot',completed:49,manualPaused:false,failStatus:false})}>{t.mockLast}</Button>
     <Button variant="secondary" onClick={()=>void apply({manualPaused:true,failStatus:false})}>{t.mockPaused}</Button>
     <Button variant="secondary" onClick={()=>void apply({phase:'main',manualPaused:false,failStatus:false})}>{t.mockMain}</Button>
     <Button variant="secondary" onClick={()=>void apply({failStatus:true})}>{t.mockError}</Button>
    </div>
    <div className="space-y-2"><p className="text-sm font-medium">{t.mockEmail}</p><Select value={db.emailScenario} onValueChange={value=>void apply({emailScenario:value as MockDatabase['emailScenario']})} options={[{value:'stored',label:t.mockStored},{value:'verified',label:t.mockVerified},{value:'pending',label:t.mockPending}]} ariaLabel={t.mockEmail} className="w-full" popupClassName="max-w-[calc(100vw-2rem)]"/></div>
    {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
   </Dialog.Body>
  </Dialog.Content>
 </Dialog>;
};
