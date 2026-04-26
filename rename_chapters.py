#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
从章纲文件中提取章节标题，批量重命名正文目录下的章节文件。
重命名规则：第X章-标题.md
"""

import os
import re
import glob

# 目录配置
ZHANGGANG_DIR = "3-大纲/章纲"         # 章纲目录
ZHENGWEN_DIR = "4-正文/第一卷  初来乍到"  # 正文目录

def extract_chapter_titles(zhanggang_dir):
    """从所有章纲文件中提取 {章节号: 标题} 映射"""
    chapter_map = {}
    
    # 匹配 "## 第X章：标题" 或 "## 第X章：标题" 格式
    pattern = re.compile(r'^##\s+第(\d+)章[：:]\s*(.+?)$')
    
    # 遍历所有章纲文件
    zhanggang_files = sorted(glob.glob(os.path.join(zhanggang_dir, "*.md")))
    
    for filepath in zhanggang_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                m = pattern.match(line.strip())
                if m:
                    chapter_num = int(m.group(1))
                    title = m.group(2).strip()
                    chapter_map[chapter_num] = title
    
    return chapter_map

def rename_files(zhengwen_dir, chapter_map):
    """根据 {章节号: 标题} 映射，重命名正文目录下的文件"""
    
    # 匹配 "第X章.md" 格式
    pattern = re.compile(r'^第(\d+)章\.md$')
    
    renamed = []
    errors = []
    
    for filename in os.listdir(zhengwen_dir):
        m = pattern.match(filename)
        if not m:
            continue
        
        chapter_num = int(m.group(1))
        if chapter_num not in chapter_map:
            errors.append(f"第{chapter_num}章：章纲中未找到对应标题")
            continue
        
        title = chapter_map[chapter_num]
        
        # 新文件名：第X章-标题.md
        # 清理标题中的非法字符
        safe_title = re.sub(r'[<>:"/\\|?*]', '', title)
        new_name = f"第{chapter_num}章-{safe_title}.md"
        
        old_path = os.path.join(zhengwen_dir, filename)
        new_path = os.path.join(zhengwen_dir, new_name)
        
        if os.path.exists(new_path):
            errors.append(f"第{chapter_num}章：目标文件已存在 {new_name}")
            continue
        
        os.rename(old_path, new_path)
        renamed.append(f"第{chapter_num}章 → 第{chapter_num}章-{title}.md")
    
    return renamed, errors

def main():
    print("=" * 60)
    print("从章纲提取章节标题...")
    chapter_map = extract_chapter_titles(ZHANGGANG_DIR)
    
    if not chapter_map:
        print("错误：未找到任何章节标题！")
        return
    
    print(f"成功提取 {len(chapter_map)} 个章节标题：")
    
    # 按章节号排序并分组打印
    sorted_chapters = sorted(chapter_map.items())
    for num, title in sorted_chapters[:10]:
        print(f"  第{num}章: {title}")
    
    if len(sorted_chapters) > 10:
        print(f"  ... (共{len(sorted_chapters)}个，省略了{len(sorted_chapters)-10}个)")
        for num, title in sorted_chapters[-3:]:
            print(f"  第{num}章: {title}")
    
    print("\n" + "=" * 60)
    print("处理正文目录文件...")
    
    renamed, errors = rename_files(ZHENGWEN_DIR, chapter_map)
    
    print(f"\n成功重命名 {len(renamed)} 个文件：")
    for r in renamed:
        print(f"  ✓ {r}")
    
    if errors:
        print(f"\n错误 {len(errors)} 个：")
        for e in errors:
            print(f"  ✗ {e}")
    
    print("\n" + "=" * 60)
    print("完成！")

if __name__ == "__main__":
    main()