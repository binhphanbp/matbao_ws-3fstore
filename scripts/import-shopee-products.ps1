param(
  [string]$InputPath = "src/data_shopee/3fstore_shopee.xlsx",
  [string]$OutputPath = "src/data/shopee-products.json"
)

$ErrorActionPreference = "Stop"

function Get-ColumnIndex {
  param([string]$CellReference)

  $letters = $CellReference -replace "\d", ""
  $index = 0

  foreach ($char in $letters.ToCharArray()) {
    $index = ($index * 26) + ([int][char]$char - [int][char]"A" + 1)
  }

  return $index - 1
}

function Get-CellText {
  param(
    [System.Xml.XmlElement]$Cell,
    [string[]]$SharedStrings
  )

  if ($Cell.t -eq "inlineStr") {
    return [string]$Cell.is.InnerText
  }

  if ($Cell.t -eq "s" -and $Cell.v) {
    $sharedIndex = [int]$Cell.v
    if ($sharedIndex -ge 0 -and $sharedIndex -lt $SharedStrings.Count) {
      return $SharedStrings[$sharedIndex]
    }
  }

  if ($Cell.v) {
    return [string]$Cell.v
  }

  return ""
}

function Convert-ToSlug {
  param([string]$Value)

  $text = $Value.ToLowerInvariant().Replace("đ", "d").Replace("Đ", "d")
  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $builder = [Text.StringBuilder]::new()

  foreach ($char in $normalized.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($char)
    }
  }

  return ($builder.ToString() -replace "[^a-z0-9]+", "-" -replace "^-|-$", "")
}

function Convert-ToNumber {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  $clean = $Value -replace "[^\d.]", ""
  if ([string]::IsNullOrWhiteSpace($clean)) {
    return $null
  }

  return [int][double]$clean
}

function Get-CleanProductName {
  param([string]$Value)

  $name = $Value

  for ($pass = 0; $pass -lt 2; $pass++) {
    $name = $name -replace "^\s*(?:\[[^\]]+\]\s*)+", ""
    $name = $name -replace "^\s*[^\p{L}\p{N}]+", ""
  }

  $name = $name -replace "\s*[|–-]\s*3F\s*Store.*$", ""
  $name = $name -replace "\s*[|–-]\s*3FSTORE.*$", ""
  $name = $name -replace "\s+", " "

  return $name.Trim()
}

function Get-ShortName {
  param([string]$Value)

  $segments = @($Value -split "\s+\|\s+" | ForEach-Object { ($_ -replace "\s+", " ").Trim() } | Where-Object { $_ })
  $short = $segments | Where-Object {
    $_ -notmatch "^(Deal|Combo|Mua nhiều|Mua càng nhiều|Siêu hời|Tiết kiệm)\b" -and
    $_ -notmatch "^\d+\s*-\s*\d+\s*(gói|lon|túi|bao)\b"
  } | Select-Object -First 1

  if ([string]::IsNullOrWhiteSpace($short)) {
    $short = $segments | Select-Object -First 1
  }

  $short = $short -replace "^Deal\s+\d+\s*-\s*\d+\s*(gói|lon|túi|bao)\s*(siêu hời)?\s*", ""
  $short = $short -replace "\s+", " "
  return $short.Trim()
}

function Get-PlainText {
  param([string]$Value)

  $text = $Value -replace "<br\s*/?>", "`n"
  $text = $text -replace "<[^>]+>", ""
  $text = $text -replace "&nbsp;", " "
  $text = $text -replace "`r", ""
  $text = $text -replace "`n{3,}", "`n`n"

  return $text.Trim()
}

function Get-ShortDescription {
  param(
    [string]$ShortDescription,
    [string]$Description,
    [string]$ProductName
  )

  if (-not [string]::IsNullOrWhiteSpace($ShortDescription)) {
    return ($ShortDescription -replace "\s+", " ").Trim()
  }

  $lines = $Description -split "`n" | ForEach-Object { ($_ -replace "\s+", " ").Trim() } | Where-Object {
    $_.Length -gt 36 -and
    $_ -notmatch "^(ĐIỂM NỔI BẬT|THÔNG TIN SẢN PHẨM|HƯỚNG DẪN|BẢO QUẢN|CAM KẾT|Lưu ý)" -and
    $_ -ne "3FStore" -and
    $_ -ne $ProductName
  }

  $line = $lines | Select-Object -First 1
  if ([string]::IsNullOrWhiteSpace($line)) {
    return "Sản phẩm được 3FStore chọn lọc cho nhu cầu chăm sóc thú cưng hằng ngày."
  }

  if ($line.Length -gt 180) {
    return ($line.Substring(0, 177).TrimEnd() + "...")
  }

  return $line
}

function Get-Audience {
  param([string]$Text)

  $lower = $Text.ToLowerInvariant()
  $isCat = $lower -match "mèo|cat|kitten"
  $isDog = $lower -match "chó|cún|dog|puppy"

  if ($isCat -and $isDog) {
    return "both"
  }

  if ($isCat) {
    return "cat"
  }

  if ($isDog) {
    return "dog"
  }

  return "all-pets"
}

function Get-ProductCategory {
  param(
    [string]$CategoryPath,
    [string]$Name
  )

  $text = ($CategoryPath + " " + $Name).ToLowerInvariant()

  if ($text -match "cát|cat litter|khay") {
    return "Cát vệ sinh"
  }

  if ($text -match "pate|súp|soup|thức ăn ướt|lon|gói 70g|gravy|mousse") {
    return "Pate & thức ăn ướt"
  }

  if ($text -match "hạt|thức ăn khô|dry food|kibble") {
    return "Hạt & thức ăn khô"
  }

  if ($text -match "snack|bánh thưởng|thưởng|xương|jerky|treat") {
    return "Snack & bánh thưởng"
  }

  if ($text -match "phụ kiện|vòng cổ|dây dắt|bát|chén|chuồng|ổ|nệm|áo|quần") {
    return "Phụ kiện"
  }

  if ($text -match "đồ chơi|bóng|cần câu|toy") {
    return "Đồ chơi"
  }

  if ($text -match "vệ sinh|tã|sữa tắm|khử mùi|làm đẹp|grooming|chăm sóc") {
    return "Chăm sóc & vệ sinh"
  }

  $parts = $CategoryPath -split ">"
  if ($parts.Count -gt 1) {
    return $parts[1].Trim()
  }

  return "Sản phẩm thú cưng"
}

function New-VariantOptions {
  param(
    [string[]]$Values,
    [string[]]$Headers
  )

  $options = New-Object System.Collections.Generic.List[object]
  $seen = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

  for ($index = 4; $index -le 43; $index++) {
    $name = $Headers[$index]
    $value = $Values[$index]

    if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($value)) {
      continue
    }

    $key = "$name`u{1f}$value"
    if ($seen.Add($key)) {
      $options.Add([ordered]@{
        name = $name
        value = $value
      })
    }
  }

  return $options
}

$resolvedInput = Resolve-Path $InputPath
$resolvedOutput = Join-Path (Get-Location) $OutputPath
$outputDirectory = Split-Path $resolvedOutput -Parent

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedInput)

try {
  $sharedStrings = @()
  $sharedEntry = $zip.GetEntry("xl/sharedStrings.xml")

  if ($sharedEntry) {
    $sharedReader = [IO.StreamReader]::new($sharedEntry.Open())
    [xml]$sharedXml = $sharedReader.ReadToEnd()
    $sharedReader.Dispose()

    $sharedStrings = @($sharedXml.sst.si | ForEach-Object { [string]$_.InnerText })
  }

  $sheetEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
  if (-not $sheetEntry) {
    throw "Không tìm thấy xl/worksheets/sheet1.xml trong workbook."
  }

  $sheetReader = [IO.StreamReader]::new($sheetEntry.Open())
  [xml]$sheetXml = $sheetReader.ReadToEnd()
  $sheetReader.Dispose()

  $namespaceManager = [Xml.XmlNamespaceManager]::new($sheetXml.NameTable)
  $namespaceManager.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

  $rows = $sheetXml.SelectNodes("//x:sheetData/x:row", $namespaceManager)
  if ($rows.Count -lt 2) {
    throw "Workbook không có dữ liệu sản phẩm."
  }

  $headerCells = @{}
  foreach ($cell in $rows[0].c) {
    $headerCells[(Get-ColumnIndex $cell.r)] = (Get-CellText $cell $sharedStrings).Trim()
  }

  $maxColumnIndex = ($headerCells.Keys | Measure-Object -Maximum).Maximum
  $headers = 0..$maxColumnIndex | ForEach-Object { [string]$headerCells[$_] }

  $groupedRows = [ordered]@{}

  foreach ($row in ($rows | Select-Object -Skip 1)) {
    $values = New-Object string[] ($maxColumnIndex + 1)

    foreach ($cell in $row.c) {
      $columnIndex = Get-ColumnIndex $cell.r
      if ($columnIndex -le $maxColumnIndex) {
        $values[$columnIndex] = (Get-CellText $cell $sharedStrings).Trim()
      }
    }

    $shopeeId = $values[53]
    $rawName = $values[1]

    if ([string]::IsNullOrWhiteSpace($shopeeId) -or [string]::IsNullOrWhiteSpace($rawName)) {
      continue
    }

    if (-not $groupedRows.Contains($shopeeId)) {
      $groupedRows[$shopeeId] = New-Object System.Collections.Generic.List[object]
    }

    $groupedRows[$shopeeId].Add($values)
  }

  $products = New-Object System.Collections.Generic.List[object]

  foreach ($entry in $groupedRows.GetEnumerator()) {
    $productRows = $entry.Value.ToArray()
    $first = $productRows[0]
    $rawName = $first[1]
    $name = Get-CleanProductName $rawName
    $shortName = Get-ShortName $name
    $description = Get-PlainText $first[3]
    $categoryPath = @($first[0] -split ">" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    $category = Get-ProductCategory $first[0] $name
    $audience = Get-Audience ($first[0] + " " + $name + " " + $description)
    $brand = if ([string]::IsNullOrWhiteSpace($first[52])) { "3FStore" } else { $first[52] }
    $variants = New-Object System.Collections.Generic.List[object]
    $images = [System.Collections.Generic.List[string]]::new()
    $imageSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $priceValues = New-Object System.Collections.Generic.List[int]
    $compareAtValues = New-Object System.Collections.Generic.List[int]
    $soldTotal = 0

    foreach ($values in $productRows) {
      $basePrice = Convert-ToNumber $values[44]
      $salePrice = Convert-ToNumber $values[45]
      $price = if ($salePrice -and $salePrice -gt 0) { $salePrice } else { $basePrice }
      $compareAtPrice = if ($salePrice -and $basePrice -and $salePrice -lt $basePrice) { $basePrice } else { $null }
      $image = $values[47]
      $sku = if ([string]::IsNullOrWhiteSpace($values[55])) { "$($entry.Key)-$($variants.Count)" } else { $values[55] }
      $sold = Convert-ToNumber $values[56]

      if ($price) {
        $priceValues.Add($price)
      }

      if ($compareAtPrice) {
        $compareAtValues.Add($compareAtPrice)
      }

      if ($sold) {
        $soldTotal += $sold
      }

      if (-not [string]::IsNullOrWhiteSpace($image) -and $imageSet.Add($image)) {
        $images.Add($image)
      }

      $options = @(New-VariantOptions $values $headers)
      $variantName = if ($options.Count -gt 0) {
        (($options | ForEach-Object { $_.value }) -join " / ")
      } else {
        "Mặc định"
      }

      $variant = [ordered]@{
        id = $sku
        name = $variantName
        options = $options
        price = $price
        compareAtPrice = $compareAtPrice
        image = if ([string]::IsNullOrWhiteSpace($image)) { $null } else { $image }
        sold = if ($sold) { $sold } else { 0 }
      }

      $variants.Add($variant)
    }

    if ($priceValues.Count -eq 0) {
      continue
    }

    $minPrice = ($priceValues | Measure-Object -Minimum).Minimum
    $maxPrice = ($priceValues | Measure-Object -Maximum).Maximum
    $minCompareAt = if ($compareAtValues.Count -gt 0) { ($compareAtValues | Measure-Object -Minimum).Minimum } else { $null }
    $imageList = $images.ToArray()
    $tags = @($brand, $category, $audience) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
    $slug = Convert-ToSlug "$shortName-$($entry.Key)"
    $shortDescription = Get-ShortDescription -ShortDescription $first[2] -Description $description -ProductName $name

    $product = [ordered]@{
      id = "shopee-$($entry.Key)"
      shopeeId = $entry.Key
      slug = $slug
      name = $name
      shortName = $shortName
      category = $category
      categoryPath = $categoryPath
      audience = $audience
      brand = $brand
      price = $minPrice
      compareAtPrice = $minCompareAt
      priceRange = [ordered]@{
        min = $minPrice
        max = $maxPrice
      }
      image = if ($imageList.Count -gt 0) { $imageList[0] } else { $null }
      images = $imageList
      shortDescription = $shortDescription
      description = $description
      sourceUrl = $first[54]
      tags = @($tags)
      sold = $soldTotal
      variants = $variants.ToArray()
    }

    $products.Add($product)
  }

  $sortedProducts = @($products | Sort-Object category, brand, shortName)
  $json = $sortedProducts | ConvertTo-Json -Depth 14
  Set-Content -Path $resolvedOutput -Value $json -Encoding utf8NoBOM

  Write-Output "Imported $($sortedProducts.Count) products / $($rows.Count - 1) rows -> $OutputPath"
}
finally {
  $zip.Dispose()
}
