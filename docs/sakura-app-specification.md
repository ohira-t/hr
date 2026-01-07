# 業務管理アプリケーション 開発仕様書
## さくらインターネット レンタルサーバー対応版

---

## 1. 概要

### 1.1 目的
部署ごとの業務データを管理する汎用的なWebアプリケーションのテンプレート仕様書。
さくらインターネットのレンタルサーバー（スタンダードプラン以上）で動作可能な構成。

### 1.2 主要機能
- データの一覧表示・検索・フィルタリング
- 詳細表示・編集・新規作成
- CSVインポート・エクスポート
- ダッシュボード（集計・可視化）
- アカウント管理（管理者/一般ユーザー）
- レスポンシブデザイン

---

## 2. 技術スタック

### 2.1 アーキテクチャ
```
┌─────────────────────────────────────────────────────────┐
│                    クライアント                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │     Next.js (Static Export) + Tailwind CSS     │   │
│  │     React + TypeScript                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                さくらレンタルサーバー                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │              PHP 8.x API Layer                  │   │
│  │         (認証・CRUD・ビジネスロジック)            │   │
│  └─────────────────────────────────────────────────┘   │
│                           │                             │
│                           ▼                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SQLite Database                    │   │
│  │           (ファイルベースDB)                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 14.x | Reactフレームワーク（静的エクスポート） |
| React | 18.x | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 3.x | スタイリング |
| shadcn/ui | latest | UIコンポーネント |
| Recharts | 2.x | グラフ・チャート |
| TanStack Table | 8.x | データテーブル |
| Lucide React | latest | アイコン |

### 2.3 バックエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| PHP | 8.0+ | APIサーバー |
| SQLite | 3.x | データベース |
| PDO | - | データベース接続 |

### 2.4 さくらサーバー要件
- **プラン**: スタンダード以上（SQLite対応）
- **PHP**: 8.0以上
- **SSL**: 無料SSL or 独自SSL

---

## 3. データベース設計

### 3.1 SQLite スキーマ

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- セッションテーブル
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- メインデータテーブル（例：案件管理）
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    item_id TEXT UNIQUE NOT NULL,        -- 管理ID
    category TEXT NOT NULL,               -- カテゴリ
    segment TEXT NOT NULL,                -- セグメント
    name TEXT NOT NULL,                   -- 名称
    status TEXT NOT NULL,                 -- ステータス
    assignee TEXT,                        -- 担当者
    target_count INTEGER DEFAULT 0,       -- 目標数
    current_count INTEGER DEFAULT 0,      -- 現在数
    start_date TEXT,                      -- 開始日
    end_date TEXT,                        -- 終了日
    notes TEXT,                           -- メモ
    next_action TEXT,                     -- 次アクション
    created_by TEXT,                      -- 作成者
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- サブデータテーブル（例：関連情報）
CREATE TABLE item_details (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    detail_type TEXT NOT NULL,
    detail_value TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 担当者マスタ
CREATE TABLE assignees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 操作ログ
CREATE TABLE activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,           -- 'create', 'update', 'delete', 'login', 'logout'
    target_type TEXT,               -- 'item', 'user', etc.
    target_id TEXT,
    details TEXT,                   -- JSON形式の詳細
    ip_address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- インデックス
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_assignee ON items(assignee);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
```

### 3.2 SQLite設定
```php
<?php
// config/database.php
define('DB_PATH', __DIR__ . '/../data/app.db');

// データベースディレクトリの権限設定
// chmod 755 data/
// chmod 644 data/app.db

function getDB(): PDO {
    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // WALモードで並行アクセス性能向上
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA foreign_keys=ON');
    
    return $db;
}
```

---

## 4. API設計

### 4.1 エンドポイント一覧

#### 認証
| メソッド | パス | 説明 | 権限 |
|---------|------|------|------|
| POST | /api/auth/login | ログイン | 全員 |
| POST | /api/auth/logout | ログアウト | 認証済 |
| GET | /api/auth/me | 現在のユーザー情報 | 認証済 |

#### ユーザー管理
| メソッド | パス | 説明 | 権限 |
|---------|------|------|------|
| GET | /api/users | ユーザー一覧 | 管理者 |
| POST | /api/users | ユーザー作成 | 管理者 |
| PUT | /api/users/{id} | ユーザー更新 | 管理者 |
| DELETE | /api/users/{id} | ユーザー削除 | 管理者 |

#### データ管理
| メソッド | パス | 説明 | 権限 |
|---------|------|------|------|
| GET | /api/items | データ一覧 | 認証済 |
| GET | /api/items/{id} | データ詳細 | 認証済 |
| POST | /api/items | データ作成 | 認証済 |
| PUT | /api/items/{id} | データ更新 | 認証済 |
| DELETE | /api/items/{id} | データ削除 | 管理者 |

#### CSV
| メソッド | パス | 説明 | 権限 |
|---------|------|------|------|
| POST | /api/csv/import | CSVインポート | 管理者 |
| GET | /api/csv/export | CSVエクスポート | 認証済 |
| GET | /api/csv/template | テンプレートDL | 認証済 |

#### マスタデータ
| メソッド | パス | 説明 | 権限 |
|---------|------|------|------|
| GET | /api/master/assignees | 担当者一覧 | 認証済 |
| POST | /api/master/assignees | 担当者追加 | 管理者 |

### 4.2 認証フロー

```
┌────────┐     ┌────────┐     ┌────────┐
│ Client │────▶│  PHP   │────▶│ SQLite │
└────────┘     └────────┘     └────────┘
     │              │              │
     │ POST /login  │              │
     │─────────────▶│              │
     │              │ SELECT user  │
     │              │─────────────▶│
     │              │◀─────────────│
     │              │              │
     │              │ password_verify()
     │              │              │
     │              │ INSERT session│
     │              │─────────────▶│
     │              │◀─────────────│
     │◀─────────────│              │
     │ Set-Cookie   │              │
     │              │              │
     │ GET /api/*   │              │
     │ Cookie: token│              │
     │─────────────▶│              │
     │              │ SELECT session│
     │              │─────────────▶│
     │              │◀─────────────│
     │◀─────────────│              │
     │ Response     │              │
```

### 4.3 PHP API サンプル構成

```
api/
├── index.php           # ルーター
├── config/
│   ├── database.php    # DB接続
│   └── config.php      # 設定
├── middleware/
│   ├── auth.php        # 認証ミドルウェア
│   └── cors.php        # CORS設定
├── controllers/
│   ├── AuthController.php
│   ├── ItemController.php
│   ├── UserController.php
│   └── CsvController.php
├── models/
│   ├── User.php
│   ├── Item.php
│   └── Session.php
└── utils/
    ├── response.php    # レスポンスヘルパー
    └── validation.php  # バリデーション
```

### 4.4 PHPルーター例

```php
<?php
// api/index.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/api', '', $uri);

// ルーティング
$routes = [
    'POST /auth/login' => ['AuthController', 'login', false],
    'POST /auth/logout' => ['AuthController', 'logout', true],
    'GET /auth/me' => ['AuthController', 'me', true],
    
    'GET /items' => ['ItemController', 'index', true],
    'GET /items/{id}' => ['ItemController', 'show', true],
    'POST /items' => ['ItemController', 'create', true],
    'PUT /items/{id}' => ['ItemController', 'update', true],
    'DELETE /items/{id}' => ['ItemController', 'delete', true, 'admin'],
    
    'GET /users' => ['UserController', 'index', true, 'admin'],
    'POST /users' => ['UserController', 'create', true, 'admin'],
    
    'POST /csv/import' => ['CsvController', 'import', true, 'admin'],
    'GET /csv/export' => ['CsvController', 'export', true],
];

// ルートマッチング処理...
```

---

## 5. フロントエンド設計

### 5.1 ディレクトリ構成

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ダッシュボード
│   ├── login/
│   │   └── page.tsx          # ログインページ
│   ├── items/
│   │   ├── page.tsx          # 一覧ページ
│   │   ├── new/
│   │   │   └── page.tsx      # 新規作成
│   │   └── [id]/
│   │       └── page.tsx      # 詳細・編集
│   ├── csv/
│   │   └── page.tsx          # CSV入出力
│   └── settings/             # 管理者のみ
│       ├── page.tsx          # 設定トップ
│       ├── users/
│       │   └── page.tsx      # ユーザー管理
│       └── master/
│           └── page.tsx      # マスタ管理
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── ui/                   # shadcn/ui コンポーネント
│   ├── dashboard/
│   ├── items/
│   └── auth/
├── lib/
│   ├── api.ts                # APIクライアント
│   ├── auth.ts               # 認証ユーティリティ
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts
│   └── use-items.ts
├── types/
│   └── index.ts              # 型定義
└── styles/
    └── globals.css           # Tailwind設定
```

### 5.2 静的エクスポート設定

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',           // 静的エクスポート
  trailingSlash: true,        // さくらサーバー対応
  images: {
    unoptimized: true,        // 画像最適化無効
  },
  // APIはPHPで別途提供するため、rewriteは不要
};

export default nextConfig;
```

### 5.3 APIクライアント

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Cookie送信
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }
  
  return response.json();
}

// 認証API
export const authApi = {
  login: (email: string, password: string) => 
    api<{ user: User; token: string }>('/auth/login', { 
      method: 'POST', 
      body: { email, password } 
    }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  me: () => api<User>('/auth/me'),
};

// データAPI
export const itemsApi = {
  list: (params?: Record<string, string>) => 
    api<Item[]>(`/items${params ? '?' + new URLSearchParams(params) : ''}`),
  get: (id: string) => api<Item>(`/items/${id}`),
  create: (data: ItemInput) => api<Item>('/items', { method: 'POST', body: data }),
  update: (id: string, data: Partial<ItemInput>) => 
    api<Item>(`/items/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/items/${id}`, { method: 'DELETE' }),
};
```

### 5.4 認証コンテキスト

```typescript
// src/hooks/use-auth.ts
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authApi.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await authApi.login(email, password);
    setUser(user);
    router.push('/');
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## 6. デザインシステム

### 6.1 設計思想（Apple的アプローチ）

#### 基本原則
1. **シンプリシティ**: 余計な要素を排除し、本質的な情報のみを表示
2. **一貫性**: 統一されたスペーシング、カラー、タイポグラフィ
3. **階層性**: 視覚的な優先順位を明確に
4. **フィードバック**: ユーザーアクションへの即時反応
5. **アクセシビリティ**: 誰もが使いやすいUI

#### ビジュアルスタイル
- **角丸**: 大きめの角丸（12px〜24px）で柔らかい印象
- **シャドウ**: 控えめで自然なシャドウ
- **余白**: 十分な余白で視認性向上
- **アニメーション**: 軽快で意味のあるトランジション

### 6.2 カラーパレット

```css
/* globals.css */
:root {
  /* プライマリカラー */
  --primary: 217 91% 60%;        /* Blue */
  --primary-foreground: 0 0% 100%;
  
  /* セカンダリカラー */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;
  
  /* 背景 */
  --background: 0 0% 98%;         /* ほぼ白 */
  --foreground: 222 47% 11%;      /* ほぼ黒 */
  
  /* カード */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  
  /* ボーダー */
  --border: 214 32% 91%;
  
  /* ステータスカラー */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
  --info: 199 89% 48%;
  
  /* シャドウ */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### 6.3 タイポグラフィ

```css
/* フォント設定 */
:root {
  --font-sans: 'Inter', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 
               'Noto Sans JP', sans-serif;
  --font-mono: 'JetBrains Mono', 'Menlo', monospace;
}

/* サイズスケール */
.text-xs   { font-size: 0.75rem; }   /* 12px */
.text-sm   { font-size: 0.875rem; }  /* 14px */
.text-base { font-size: 1rem; }      /* 16px */
.text-lg   { font-size: 1.125rem; }  /* 18px */
.text-xl   { font-size: 1.25rem; }   /* 20px */
.text-2xl  { font-size: 1.5rem; }    /* 24px */
.text-3xl  { font-size: 1.875rem; }  /* 30px */
```

### 6.4 スペーシング

```css
/* 8pxグリッドシステム */
.space-1  { margin/padding: 0.25rem; }  /*  4px */
.space-2  { margin/padding: 0.5rem; }   /*  8px */
.space-3  { margin/padding: 0.75rem; }  /* 12px */
.space-4  { margin/padding: 1rem; }     /* 16px */
.space-6  { margin/padding: 1.5rem; }   /* 24px */
.space-8  { margin/padding: 2rem; }     /* 32px */
```

### 6.5 コンポーネントスタイル

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "border border-gray-200 bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
```

### 6.6 アニメーション

```css
/* globals.css */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

/* 段階的なアニメーション */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
```

---

## 7. 画面設計

### 7.1 画面一覧

| 画面 | パス | 権限 | 説明 |
|------|------|------|------|
| ログイン | /login | 未認証 | ログインフォーム |
| ダッシュボード | / | 全員 | 集計・グラフ表示 |
| データ一覧 | /items | 全員 | 検索・フィルター付き一覧 |
| データ詳細 | /items/[id] | 全員 | 詳細表示・編集 |
| 新規作成 | /items/new | 全員 | データ新規作成 |
| CSV入出力 | /csv | 全員 | インポート・エクスポート |
| 設定 | /settings | 管理者 | システム設定 |
| ユーザー管理 | /settings/users | 管理者 | ユーザーCRUD |
| マスタ管理 | /settings/master | 管理者 | マスタデータ管理 |

### 7.2 レイアウト構成

```
┌─────────────────────────────────────────────────────────┐
│                      Header                             │
│  [Logo] [タイトル]              [検索] [ユーザーメニュー] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │                  Main Content                │
│          │                                              │
│ [メニュー] │  ┌──────────────────────────────────────┐  │
│          │  │         Page Header                   │  │
│ - ダッシュ │  │  タイトル              [アクション]   │  │
│ - 一覧    │  └──────────────────────────────────────┘  │
│ - CSV    │                                              │
│          │  ┌──────────────────────────────────────┐  │
│ [管理者]  │  │                                      │  │
│ - 設定   │  │           Page Content               │  │
│          │  │                                      │  │
│          │  └──────────────────────────────────────┘  │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 7.3 ダッシュボード構成

```
┌──────────────────────────────────────────────────────────┐
│  ダッシュボード                      [期間選択] [更新]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  KPI 1   │  │  KPI 2   │  │  KPI 3   │  │  KPI 4   │ │
│  │  総件数   │  │ アクティブ │  │ 完了率   │  │ 達成率   │ │
│  │  123件   │  │   45件   │  │  67.5%  │  │  82.3%  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                          │
│  ┌─────────────────────────┐  ┌─────────────────────────┐│
│  │                         │  │                         ││
│  │      進捗チャート        │  │      アラート一覧       ││
│  │      (Recharts)        │  │    - 期限間近: 5件      ││
│  │                         │  │    - 長期停滞: 3件      ││
│  └─────────────────────────┘  └─────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              カテゴリ別集計                          │ │
│  │  [カテゴリA] ████████████░░░░ 75%                   │ │
│  │  [カテゴリB] ██████████████░░ 85%                   │ │
│  │  [カテゴリC] ██████░░░░░░░░░░ 40%                   │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 8. CSV機能

### 8.1 インポート仕様

#### 対応フォーマット
- **文字コード**: UTF-8（BOM付き対応）、Shift_JIS
- **区切り文字**: カンマ（,）
- **改行**: CR+LF、LF
- **引用符**: ダブルクォート（"）

#### インポート処理フロー
```
1. ファイルアップロード
2. 文字コード検出・変換
3. CSVパース
4. バリデーション
5. 既存データとの照合（キー項目で判定）
6. 新規/更新/スキップの判定
7. プレビュー表示
8. ユーザー確認
9. データベース更新
10. 結果レポート表示
```

#### バリデーションルール
```php
$rules = [
    'item_id' => ['required', 'format' => '/^[A-Z]\d{4}-\d{2}$/'],
    'name' => ['required', 'max' => 100],
    'category' => ['required', 'in' => ['カテゴリA', 'カテゴリB', 'カテゴリC']],
    'status' => ['required', 'in' => ['未着手', '進行中', '完了']],
    'start_date' => ['date_format' => 'Y/m/d'],
    'end_date' => ['date_format' => 'Y/m/d', 'after' => 'start_date'],
];
```

### 8.2 エクスポート仕様

#### 出力オプション
- 全件エクスポート
- フィルター条件でエクスポート
- 選択項目のみエクスポート

#### ファイル形式
```
ファイル名: データ名_YYYYMMDD_HHMMSS.csv
文字コード: UTF-8 (BOM付き) ※Excel対応
```

### 8.3 CSVテンプレート

```csv
管理ID,カテゴリ,セグメント,名称,ステータス,担当者,目標数,現在数,開始日,終了日,メモ,次アクション
A0001-01,カテゴリA,新規,サンプル案件,進行中,山田太郎,10,5,2024/01/01,2024/03/31,備考テキスト,次回アクション内容
```

---

## 9. アカウント管理

### 9.1 権限モデル

| 権限 | 説明 | 許可される操作 |
|------|------|---------------|
| admin | 管理者 | 全ての操作、設定画面へのアクセス |
| user | 一般ユーザー | データの閲覧・作成・編集（自分のもの） |

### 9.2 権限マトリクス

| 機能 | admin | user |
|------|:-----:|:----:|
| ダッシュボード閲覧 | ✓ | ✓ |
| データ一覧閲覧 | ✓ | ✓ |
| データ詳細閲覧 | ✓ | ✓ |
| データ新規作成 | ✓ | ✓ |
| データ編集 | ✓ | ✓ |
| データ削除 | ✓ | ✗ |
| CSVインポート | ✓ | ✗ |
| CSVエクスポート | ✓ | ✓ |
| ユーザー管理 | ✓ | ✗ |
| マスタ管理 | ✓ | ✗ |
| 設定画面 | ✓ | ✗ |

### 9.3 セキュリティ対策

```php
// パスワードハッシュ化
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// パスワード検証
$isValid = password_verify($inputPassword, $storedHash);

// セッショントークン生成
$token = bin2hex(random_bytes(32));

// CSRF対策
$csrfToken = bin2hex(random_bytes(32));
$_SESSION['csrf_token'] = $csrfToken;

// XSS対策
$safeOutput = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');

// SQLインジェクション対策（PDO Prepared Statement）
$stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
```

---

## 10. デプロイメント

### 10.1 さくらサーバー構成

```
www/
├── index.html              # SPAエントリーポイント
├── _next/                  # Next.js静的ファイル
│   ├── static/
│   └── ...
├── api/                    # PHP API
│   ├── .htaccess           # リライトルール
│   ├── index.php           # APIルーター
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── ...
├── data/                   # SQLiteデータベース
│   ├── .htaccess           # アクセス拒否
│   └── app.db
└── .htaccess               # メインリライトルール
```

### 10.2 .htaccess設定

```apache
# www/.htaccess
RewriteEngine On
RewriteBase /

# APIリクエストはPHPへ
RewriteRule ^api/(.*)$ api/index.php [L,QSA]

# 静的ファイルはそのまま
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# それ以外はSPAへ
RewriteRule ^ index.html [L]

# データディレクトリへのアクセス拒否
<FilesMatch "\.db$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

```apache
# data/.htaccess
Order Allow,Deny
Deny from all
```

### 10.3 ビルド・デプロイ手順

```bash
# 1. フロントエンドビルド
npm run build

# 2. 出力ディレクトリ確認
ls out/

# 3. FTPまたはSCPでアップロード
# out/ → www/
# api/ → www/api/
# data/app.db → www/data/app.db

# 4. パーミッション設定
chmod 755 www/api/
chmod 644 www/api/*.php
chmod 755 www/data/
chmod 644 www/data/app.db
```

### 10.4 初期セットアップスクリプト

```php
<?php
// setup.php - 初回のみ実行
require_once __DIR__ . '/api/config/database.php';

$db = getDB();

// テーブル作成
$db->exec(file_get_contents(__DIR__ . '/api/schema.sql'));

// 管理者ユーザー作成
$adminPassword = password_hash('初期パスワード', PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([
    bin2hex(random_bytes(16)),
    'admin@example.com',
    $adminPassword,
    '管理者',
    'admin'
]);

echo "Setup completed!\n";
echo "Admin Email: admin@example.com\n";
echo "Admin Password: 初期パスワード\n";
echo "※ログイン後、必ずパスワードを変更してください。\n";

// セットアップファイルを削除
unlink(__FILE__);
```

---

## 11. カスタマイズガイド

### 11.1 新規アプリ作成時のチェックリスト

#### データモデル定義
- [ ] 管理する項目の洗い出し
- [ ] データベーススキーマ設計
- [ ] 型定義ファイル作成

#### UI設計
- [ ] カテゴリ・ステータスの定義
- [ ] カラー設定
- [ ] フィルター項目の決定

#### 機能設定
- [ ] 権限設計（どの操作を誰に許可するか）
- [ ] CSVフォーマット定義
- [ ] バリデーションルール設定

### 11.2 カスタマイズポイント

```typescript
// src/types/index.ts - 型定義をカスタマイズ
export interface Item {
  id: string;
  itemId: string;
  // ここにアプリ固有のフィールドを追加
  customField1: string;
  customField2: number;
  // ...
}

// src/lib/constants.ts - 定数をカスタマイズ
export const CATEGORIES = ['カテゴリA', 'カテゴリB', 'カテゴリC'] as const;
export const STATUSES = ['未着手', '進行中', '完了'] as const;

// src/lib/category-utils.ts - 色設定をカスタマイズ
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'カテゴリA': 'bg-blue-100 text-blue-800',
    'カテゴリB': 'bg-green-100 text-green-800',
    'カテゴリC': 'bg-purple-100 text-purple-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}
```

---

## 12. 運用・保守

### 12.1 バックアップ

```bash
# SQLiteデータベースのバックアップ（cron設定）
# 毎日深夜2時に実行
0 2 * * * cp /home/user/www/data/app.db /home/user/backup/app_$(date +\%Y\%m\%d).db

# 7日以上前のバックアップを削除
0 3 * * * find /home/user/backup -name "app_*.db" -mtime +7 -delete
```

### 12.2 ログ管理

```php
// ログ出力ユーティリティ
function writeLog(string $level, string $message, array $context = []): void {
    $logDir = __DIR__ . '/../logs';
    $logFile = $logDir . '/app_' . date('Y-m-d') . '.log';
    
    $entry = sprintf(
        "[%s] [%s] %s %s\n",
        date('Y-m-d H:i:s'),
        strtoupper($level),
        $message,
        $context ? json_encode($context, JSON_UNESCAPED_UNICODE) : ''
    );
    
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}
```

### 12.3 エラーハンドリング

```php
// グローバルエラーハンドラー
set_exception_handler(function (Throwable $e) {
    writeLog('error', $e->getMessage(), [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => '内部エラーが発生しました'
    ]);
    exit;
});
```

---

## 13. 付録

### 13.1 必要なPHP拡張

- PDO
- PDO_SQLite
- json
- mbstring
- openssl

### 13.2 推奨開発環境

- VSCode + PHP Intelephense
- Node.js 18.x以上
- PHP 8.0以上（ローカル開発用）
- SQLite Browser（DB確認用）

### 13.3 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [PHP PDO](https://www.php.net/manual/ja/book.pdo.php)
- [SQLite](https://www.sqlite.org/docs.html)

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2026/01/07 | 初版作成 |


