# Groq Models Information & Testing

## 🔍 Current Model Configuration

| Lynxa Model | Groq Model | Token Limits | Speed |
|-------------|------------|--------------|-------|
| **Lynxa Lite** | `llama-3.1-8b-instant` | 8,192 tokens context | ⚡⚡⚡ Fastest |
| **Lynxa Pro** | `llama-3.3-70b-versatile` | 32,768 tokens context | ⚡⚡ Fast |
| **Lynxa Reasoning** | `deepseek-r1-distill-llama-70b` | 8,192 tokens context | ⚡ Moderate |

---

## 📊 Groq Free Tier Limits (Per API Key)

### Daily Limits:
- **Requests per Day**: 14,400 requests
- **Tokens per Day**: 100,000 tokens
- **Requests per Minute**: 30 requests

### With 5 API Keys (Your Setup):
- **Total Requests per Day**: 72,000 requests
- **Total Tokens per Day**: 500,000 tokens
- **Effective RPM**: 150 requests/minute

---

## 🧪 Test Your Groq API Keys

### 1. Check Available Models

**Windows PowerShell**:
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_GROQ_API_KEY_HERE"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/models" -Method Get -Headers $headers | ConvertTo-Json -Depth 10
```

**Windows CMD (using curl)**:
```cmd
curl -X GET "https://api.groq.com/openai/v1/models" ^
  -H "Authorization: Bearer YOUR_GROQ_API_KEY_HERE" ^
  -H "Content-Type: application/json"
```

**Git Bash / WSL**:
```bash
curl -X GET "https://api.groq.com/openai/v1/models" \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY_HERE" \
  -H "Content-Type: application/json"
```

---

### 2. Test Llama 3.1 8B (Lynxa Lite)

**PowerShell**:
```powershell
$body = @{
    model = "llama-3.1-8b-instant"
    messages = @(
        @{
            role = "user"
            content = "Say hello!"
        }
    )
    max_tokens = 100
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer YOUR_GROQ_API_KEY_HERE"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/chat/completions" -Method Post -Headers $headers -Body $body | ConvertTo-Json -Depth 10
```

**CMD/Bash**:
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"llama-3.1-8b-instant\",\"messages\":[{\"role\":\"user\",\"content\":\"Say hello!\"}],\"max_tokens\":100}"
```

---

### 3. Test Llama 3.3 70B (Lynxa Pro)

**CMD/Bash**:
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"llama-3.3-70b-versatile\",\"messages\":[{\"role\":\"user\",\"content\":\"Say hello!\"}],\"max_tokens\":100}"
```

---

### 4. Test DeepSeek R1 (Lynxa Reasoning)

**CMD/Bash**:
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"deepseek-r1-distill-llama-70b\",\"messages\":[{\"role\":\"user\",\"content\":\"What is 2+2?\"}],\"max_tokens\":500}"
```

---

## 🔧 If DeepSeek R1 Doesn't Work

The DeepSeek R1 model might not be available in Groq's free tier or your region. Here are alternatives:

### Option 1: Use Llama 3.3 70B for Reasoning
This model is powerful enough for reasoning tasks.

### Option 2: Use Llama 3.1 70B Versatile
Another strong alternative for reasoning.

### Option 3: Disable Reasoning Model
Remove it from the model selector if not available.

---

## 🔄 Alternative Models Available on Groq

| Model ID | Description | Context | Speed |
|----------|-------------|---------|-------|
| `llama-3.1-8b-instant` | Fast, efficient | 8K | ⚡⚡⚡ |
| `llama-3.1-70b-versatile` | Powerful, versatile | 32K | ⚡⚡ |
| `llama-3.3-70b-versatile` | Latest, most capable | 32K | ⚡⚡ |
| `llama-3.3-70b-specdec` | Speculative decoding | 8K | ⚡⚡⚡ |
| `mixtral-8x7b-32768` | Mixture of experts | 32K | ⚡⚡ |
| `gemma2-9b-it` | Google's Gemma | 8K | ⚡⚡ |

---

## 🎯 Recommended Configuration

### If DeepSeek R1 Works:
```
✅ Keep current setup
- Lite: llama-3.1-8b-instant
- Pro: llama-3.3-70b-versatile
- Reasoning: deepseek-r1-distill-llama-70b
```

### If DeepSeek R1 Doesn't Work:
```
Option A: Use Llama 3.3 70B for Reasoning
- Lite: llama-3.1-8b-instant
- Pro: llama-3.3-70b-versatile
- Reasoning: llama-3.3-70b-versatile (same as Pro)

Option B: Use Llama 3.1 70B for Reasoning
- Lite: llama-3.1-8b-instant
- Pro: llama-3.3-70b-versatile
- Reasoning: llama-3.1-70b-versatile
```

---

## 📝 How to Change the Reasoning Model

Edit `lib/ai/providers.ts`:

```typescript
// Current (DeepSeek R1)
"chat-model-reasoning": wrapLanguageModel({
  middleware: extractReasoningMiddleware({
    tagName: "think",
  }),
  model: createRotatingGroqModel("deepseek-r1-distill-llama-70b"),
}),

// Alternative 1: Llama 3.3 70B
"chat-model-reasoning": wrapLanguageModel({
  middleware: extractReasoningMiddleware({
    tagName: "think",
  }),
  model: createRotatingGroqModel("llama-3.3-70b-versatile"),
}),

// Alternative 2: Llama 3.1 70B
"chat-model-reasoning": wrapLanguageModel({
  middleware: extractReasoningMiddleware({
    tagName: "think",
  }),
  model: createRotatingGroqModel("llama-3.1-70b-versatile"),
}),

// Alternative 3: Remove reasoning wrapper (no <think> tags)
"chat-model-reasoning": createRotatingGroqModel("llama-3.3-70b-versatile"),
```

---

## 🚨 Common Issues

### Issue 1: "Model not found"
**Solution**: The model isn't available on your API key. Try alternatives above.

### Issue 2: "Rate limit exceeded"
**Solution**: Your 5-key rotation should handle this. Check Vercel logs to verify rotation is working.

### Issue 3: "Invalid API key"
**Solution**: Verify all 5 keys are correctly set in Vercel environment variables.

### Issue 4: Empty responses from Reasoning model
**Solution**: The model might not support the reasoning middleware. Try Alternative 3 above.

---

## 🔍 Check Your Setup

1. **Test API Key**:
   ```bash
   curl -X GET "https://api.groq.com/openai/v1/models" \
     -H "Authorization: Bearer YOUR_KEY"
   ```

2. **Check Vercel Logs**:
   - Go to Vercel → Your Project → Functions
   - Look for: `[Groq] Initialized with 5 API key(s)`

3. **Test Each Model**:
   - Use the curl commands above
   - Replace `YOUR_GROQ_API_KEY_HERE` with your actual key

---

## 💡 Quick Test Script

Save this as `test-groq.ps1` (PowerShell):

```powershell
$apiKey = "YOUR_GROQ_API_KEY_HERE"
$models = @("llama-3.1-8b-instant", "llama-3.3-70b-versatile", "deepseek-r1-distill-llama-70b")

foreach ($model in $models) {
    Write-Host "`nTesting $model..." -ForegroundColor Cyan
    
    $body = @{
        model = $model
        messages = @(@{role = "user"; content = "Say hi!"})
        max_tokens = 50
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/chat/completions" -Method Post -Headers $headers -Body $body
        Write-Host "✅ $model works!" -ForegroundColor Green
        Write-Host "Response: $($response.choices[0].message.content)" -ForegroundColor White
    }
    catch {
        Write-Host "❌ $model failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

Run: `.\test-groq.ps1`

---

**Last Updated**: October 12, 2025
