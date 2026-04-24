const fs = require('fs');
const path = require('path');

// 读取txt文件
const content = fs.readFileSync('4-正文/第1卷  初来乍到.txt', 'utf-8');

// 找到所有章节标题
const pattern = /^第(\d+)章.*$/gm;
const matches = [];
let match;

while ((match = pattern.exec(content)) !== null) {
    matches.push({
        num: parseInt(match[1]),
        title: match[0],
        start: match.index
    });
}

console.log(`找到 ${matches.length} 个章节`);

// 创建第13章及以后的文件
for (let i = 0; i < matches.length; i++) {
    const chapter = matches[i];
    const chapterNum = chapter.num;
    
    // 跳过前12章
    if (chapterNum <= 12) {
        console.log(`跳过第${chapterNum}章（已存在）`);
        continue;
    }
    
    // 计算结束位置
    let endPos;
    if (i < matches.length - 1) {
        endPos = matches[i + 1].start;
    } else {
        endPos = content.length;
    }
    
    // 提取章节内容
    const chapterContent = content.slice(chapter.start, endPos).trim();
    
    // 创建文件名
    const filename = `4-正文/第${chapterNum}章.md`;
    
    // 写入文件
    const lines = chapterContent.split('\n');
    let mdContent = `# ${chapter.title}\n\n`;
    
    // 跳过第一行（标题）
    if (lines.length > 1) {
        mdContent += lines.slice(1).join('\n').trim();
    }
    
    fs.writeFileSync(filename, mdContent, 'utf-8');
    console.log(`已创建: ${filename} - ${chapter.title}`);
}

console.log(`\n完成！共创建了 ${matches.length - 12} 个新章节文件`);