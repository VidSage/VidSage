import { atom } from 'jotai';
import { VideoSummary } from '../../main/types';

const summaryAtom = atom<VideoSummary[]>([]);

export default summaryAtom;
