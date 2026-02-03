import { ScrapeResult, Folder, Cookie } from '../types';

export const MOCK_FOLDERS: Folder[] = [
  { id: 'all', name: '所有笔记', icon: 'fa-layer-group' },
  { id: 'beauty', name: '美妆竞品', icon: 'fa-wand-magic-sparkles' },
  { id: 'tech', name: '科技灵感', icon: 'fa-microchip' },
  { id: 'copy', name: '爆款文案', icon: 'fa-pen-nib' },
];

export const MOCK_COOKIES: Cookie[] = [
  { id: '1', value: 'session=abc...', status: 'active', lastUsed: '2023-10-27 10:00', note: '主账号 A' },
  { id: '2', value: 'session=xyz...', status: 'invalid', lastUsed: '2023-10-26 14:30', note: '备用账号 B (已失效)' },
];

export const MOCK_RESULTS: ScrapeResult[] = [
  {
    id: '1',
    status: 'completed',
    scrapedAt: '2023-10-27T10:30:00Z',
    note: {
      id: 'n1',
      title: '30天精通Python（从小白到大神）',
      content: '这是我掌握 Python 的详细故事。第一天安装环境，第二天学习变量...',
      url: 'https://www.xiaohongshu.com/explore/123456',
      coverImage: 'https://picsum.photos/400/500',
      stats: { likes: 12500, collects: 8400, comments: 450, shares: 200 },
      author: { name: '技术宅小王', avatar: 'https://picsum.photos/50/50', followers: 50000 },
      postedAt: '2023-10-20',
      groupId: 'tech'
    },
    analysis: {
      viralReasons: [
        '强情感共鸣: 使用了“小白逆袭”的经典叙事原型。',
        '高实用价值: 提供了清晰的30天学习路线图。',
        '视觉冲击: 使用了代码前后的对比截图。'
      ],
      improvements: [
        '开头的前3秒吸引力稍弱，建议直接展示高薪Offer截图。',
        '评论区引导 (CTA) 可以更强硬一些。'
      ],
      userPsychology: '目标受众是渴望转行或提升技能但感到迷茫的学生和职场新人，他们渴望高薪和清晰的指引。',
      tags: ['教育', 'Python', '职场成长']
    }
  },
  {
    id: '2',
    status: 'completed',
    scrapedAt: '2023-10-26T15:20:00Z',
    note: {
      id: 'n2',
      title: '秋冬干皮救星！这套护肤流程绝了',
      content: '使用的产品列表: ...',
      url: 'https://www.xiaohongshu.com/explore/789012',
      coverImage: 'https://picsum.photos/400/501',
      stats: { likes: 3200, collects: 1200, comments: 80, shares: 45 },
      author: { name: '美妆洁', avatar: 'https://picsum.photos/51/51', followers: 12000 },
      postedAt: '2023-10-25',
      groupId: 'beauty'
    },
    analysis: {
      viralReasons: ['季节性强 (秋冬)', '精准痛点打击 (干皮)'],
      improvements: ['第二张图的光线太暗了，看不清质地。', '列出具体价格会增加收藏率。'],
      userPsychology: '用户在换季时普遍存在皮肤焦虑，急需一套现成的解决方案。',
      tags: ['美妆', '护肤', '干皮']
    }
  }
];