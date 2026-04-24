# 读取文件内容
$content = Get-Content "4-正文\第1卷  初来乍到.txt" -Raw -Encoding UTF8

# 定义章节正则表达式
$pattern = "(?m)^第(\d+)章[^\n]*"

# 查找所有章节匹配
$matches = [regex]::Matches($content, $pattern)

Write-Host "找到 $($matches.Count) 个章节" -ForegroundColor Green

# 遍历匹配项
for ($i = 0; $i -lt $matches.Count; $i++) {
    $match = $matches[$i]
    $chapterNum = [int]$match.Groups[1].Value
    $chapterTitle = $match.Value.Trim()
    
    # 跳过前12章
    if ($chapterNum -le 12) {
        Write-Host "跳过第 $chapterNum 章（已存在）" -ForegroundColor Yellow
        continue
    }
    
    # 计算章节内容
    $startPos = $match.Index
    if ($i -lt $matches.Count - 1) {
        $endPos = $matches[$i + 1].Index
    } else {
        $endPos = $content.Length
    }
    
    # 提取章节内容
    $chapterContent = $content.Substring($startPos, $endPos - $startPos).Trim()
    
    # 创建文件
    $filename = "4-正文\第${chapterNum}章.md"
    
    # 构建md内容
    $lines = $chapterContent -split "`n"
    $mdContent = "# $chapterTitle`r`n`r`n"
    if ($lines.Count -gt 1) {
        $mdContent += ($lines[1..($lines.Count-1)] -join "`r`n").Trim()
    }
    
    # 写入文件
    $mdContent | Out-File -FilePath $filename -Encoding UTF8
    Write-Host "已创建: $filename - $chapterTitle" -ForegroundColor Cyan
}

Write-Host "`n完成！共创建了 $($matches.Count - 12) 个新章节文件" -ForegroundColor Green