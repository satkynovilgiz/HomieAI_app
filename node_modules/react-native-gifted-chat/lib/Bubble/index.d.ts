import React from 'react';
import { IMessage } from '../types';
import { BubbleProps } from './types';
export * from './types';
declare const Bubble: React.FC<BubbleProps<IMessage>>;
export default Bubble;
