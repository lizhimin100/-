#!/usr/bin/env node
// -*- coding: utf-8 -*-
/**
 * 从章纲文件中提取章节标题，批量重命名正文目录下的章节文件。
 * 重命名规则：第X章-标题.md
 */

import fs from 'fs';
import path from 'path';

// 目录配置
const ZHANGGANG_DIR = "3-大纲/章纲";
const ZHENGWEN_DIR = "4-正文/第一卷  初来乍到";

/**
 * 从所有章纲文件中提取 {章节号: 标题} 映射
 */
function extractChapterTitles(zhanggangDir) {
    const chapterMap = {};

    // 中文数字映射
    const cnNumMap = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
        '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20,
        '二十一': 21, '二十二': 22, '二十三': 23, '二十四': 24, '二十五': 25,
        '二十六': 26, '二十七': 27, '二十八': 28, '二十九': 29, '三十': 30,
        '三十一': 31, '三十二': 32, '三十三': 33, '三十四': 34, '三十五': 35,
        '三十六': 36, '三十七': 37, '三十八': 38, '三十九': 39, '四十': 40,
    };

    // 匹配 "## 第X章：标题" 格式（支持阿拉伯数字和中文数字）
    const patternArabic = /^##\s+第(\d+)章[：:]\s*(.+?)$/;
    const patternChinese = /^##\s+第([一二三四五六七八九十]+)章[：:]\s*(.+?)$/;

    // 获取章纲目录下所有 .md 文件
    const files = fs.readdirSync(zhanggangDir)
        .filter(f => f.endsWith('.md'))
        .sort();

    for (const file of files) {
        const filepath = path.join(zhanggangDir, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            // 尝试匹配阿拉伯数字
            let m = trimmed.match(patternArabic);
            if (m) {
                const chapterNum = parseInt(m[1], 10);
                const title = m[2].trim();
                chapterMap[chapterNum] = title;
                continue;
            }
            // 尝试匹配中文数字
            m = trimmed.match(patternChinese);
            if (m) {
                const cnStr = m[1];
                if (cnNumMap[cnStr] !== undefined) {
                    const chapterNum = cnNumMap[cnStr];
                    const title = m[2].trim();
                    chapterMap[chapterNum] = title;
                }
            }
        }
    }

    return chapterMap;
}

/**
 * 根据 {章节号: 标题} 映射，重命名正文目录下的文件
 */
function renameFiles(zhengwenDir, chapterMap) {
    // 匹配 "第X章.md" 格式
    const filePattern = /^第(\d+)章\.md$/;

    const renamed = [];
    const errors = [];

    const dirContents = fs.readdirSync(zhengwenDir);

    for (const filename of dirContents) {
        const m = filename.match(filePattern);
        if (!m) continue;

        const chapterNum = parseInt(m[1], 10);

        if (!(chapterNum in chapterMap)) {
            errors.push(`第${chapterNum}章：章纲中未找到对应标题`);
            continue;
        }

        const title = chapterMap[chapterNum];

        // 清理标题中的非法字符（Windows文件名不允许的字符）
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '');
        const newName = `第${chapterNum}章-${safeTitle}.md`;

        const oldPath = path.join(zhengwenDir, filename);
        const newPath = path.join(zhengwenDir, newName);

        if (fs.existsSync(newPath)) {
            errors.push(`第${chapterNum}章：目标文件已存在 ${newName}`);
            continue;
        }

        fs.renameSync(oldPath, newPath);
        renamed.push(`第${chapterNum}章 → 第${chapterNum}章-${title}.md`);
    }

    return { renamed, errors };
}

function main() {
    console.log("=".repeat(60));
    console.log("从章纲提取章节标题...");
    const chapterMap = extractChapterTitles(ZHANGGANG_DIR);

    const sortedChapters = Object.entries(chapterMap).sort((a, b) => a[0] - b[0]);

    if (sortedChapters.length === 0) {
        console.log("错误：未找到任何章节标题！");
        return;
    }

    console.log(`成功提取 ${sortedChapters.length} 个章节标题（展示前10个和后3个）：`);
    for (const [num, title] of sortedChapters.slice(0, 10)) {
        console.log(`  第${num}章: ${title}`);
    }
    if (sortedChapters.length > 10) {
        console.log(`  ... 共${sortedChapters.length}个 ...`);
        for (const [num, title] of sortedChapters.slice(-3)) {
            console.log(`  第${num}章: ${title}`);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("处理正文目录文件...");

    const { renamed, errors } = renameFiles(ZHENGWEN_DIR, chapterMap);

    console.log(`\n成功重命名 ${renamed.length} 个文件：`);
    for (const r of renamed) {
        console.log(`  ✓ ${r}`);
    }

    if (errors.length > 0) {
        console.log(`\n错误 ${errors.length} 个：`);
        for (const e of errors) {
            console.log(`  ✗ ${e}`);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("完成！");
}

main();