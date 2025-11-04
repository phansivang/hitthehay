import React from 'react';
import { Clock, UploadCloud, Cpu, Bot, Youtube, Instagram, Facebook, FileText } from 'lucide-react';
import TiktokIcon from '@/shared/icons/TiktokIcon';
import type { SidebarNode } from '@/shared/types';
import { NodeCategory } from '@/shared/types';

export const NODE_LIBRARY: SidebarNode[] = [
  {
    type: 'triggerTime',
    label: 'Time Trigger',
    description: 'Schedule time to start your video generation.',
    icon: Clock,
    category: NodeCategory.Triggers,
    defaultSettings: { time: '06:00' }
  },
  {
    type: 'videoUpload',
    label: 'Upload Video',
    description: 'Upload a video file as a source.',
    icon: UploadCloud,
    category: NodeCategory.VideoSource,
    defaultSettings: { files: [] }
  },
  {
    type: 'aiModelSora2',
    label: 'Sora 2',
    description: 'Generate video using the Sora 2 AI model.',
    icon: Cpu,
    category: NodeCategory.AIModels,
    defaultSettings: { model: 'Sora 2', prompt: '' }
  },
  {
    type: 'aiModelSora2Pro',
    label: 'Sora 2 Pro',
    description: 'Generate video using the Sora 2 Pro AI model.',
    icon: Cpu,
    category: NodeCategory.AIModels,
    defaultSettings: { model: 'Sora 2 Pro', prompt: '' }
  },
  {
    type: 'aiModelVeo3',
    label: 'Veo 3',
    description: 'Generate video using the Veo 3 AI model.',
    icon: Bot,
    category: NodeCategory.AIModels,
    defaultSettings: { model: 'Veo 3', prompt: '' }
  },
  {
    type: 'promptConfig',
    label: 'Prompt Config',
    description: 'Configure creative input for AI models.',
    icon: FileText,
    category: NodeCategory.PromptConfig,
    defaultSettings: { prompt: 'A cinematic shot of...' }
  },
  {
    type: 'platformTikTok',
    label: 'Post to TikTok',
    description: 'Post the generated video to TikTok.',
    icon: TiktokIcon,
    category: NodeCategory.Platforms,
    defaultSettings: { account: '', caption: '', hashtags: '' }
  },
  {
    type: 'platformYouTube',
    label: 'Post to YouTube',
    description: 'Post the generated video to YouTube.',
    icon: Youtube,
    category: NodeCategory.Platforms,
    defaultSettings: { account: '', title: '', description: '' }
  },
  {
    type: 'platformInstagram',
    label: 'Post to Instagram',
    description: 'Post the generated video to Instagram.',
    icon: Instagram,
    category: NodeCategory.Platforms,
    defaultSettings: { account: '', caption: '' }
  },
  {
    type: 'platformFacebook',
    label: 'Post to Facebook',
    description: 'Post the generated video to Facebook.',
    icon: Facebook,
    category: NodeCategory.Platforms,
    defaultSettings: { account: '', text: '' }
  }
];
