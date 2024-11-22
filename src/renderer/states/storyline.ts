import { atom } from 'jotai';
import { Segment } from '../../main/types';

const storylineAtom = atom<Segment[]>([]);

export default storylineAtom;
