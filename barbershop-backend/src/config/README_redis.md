# REDIS LOCAL

Cea mai simplă variantă pentru dezvoltare, dacă ai Docker:

```bash
    docker run -d --name barbershop-redis -p 6379:6379 redis:7-alpine
```

Fără Docker: pe Windows folosești WSL2:

```bash 
    sudo apt install redis-server
```

# PACHETE

```bash 
    npm install rate-limit-redis redis
```

# CLEINTUL REDIS

Creează **src/config/redis.ts**, lângă **db.ts**:

```typescript
    import { createClient } from 'redis';

    export const redisClient = createClient({
        url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
        console.error('Eroare Redis:', err);
    });

    export async function connectRedis(): Promise<void> {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis conectat.');
        }
    }
```

În **.env**:
```
REDIS_URL=redis://localhost:6379
```

În **server.ts**, conectezi înainte de a porni serverul:

```typescript
    import { connectRedis } from './config/redis';

    async function start() {
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server pornit pe portul ${PORT}`);
        });
    }

    start().catch((err) => {
        console.error('Eroare la pornirea serverului:', err);
        process.exit(1);
    });

```

# LIMITATOARELE

```typescript

    import rateLimit from 'express-rate-limit';
    import { RedisStore } from 'rate-limit-redis';
    import { redisClient } from '../config/redis';

    // Limitare per IP
    const forgotPasswordLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 3,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        skipFailedRequests: true,
        message: {
            success: false,
            message: 'Prea multe cereri de resetare. Încearcă din nou peste 15 minute.',
        },
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: 'rl:forgot:ip:',
        }),
    });

    // Limitare per adresă de email
    const forgotPasswordEmailLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        limit: 3,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        skipFailedRequests: true,
        keyGenerator: (req) => {
            const email = typeof req.body?.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';
            return email;
        },
        message: {
            success: false,
            message: 'Prea multe cereri pentru această adresă. Încearcă din nou mai târziu.',
        },
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: 'rl:forgot:email:',
        }),
    });

router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordEmailLimiter, async (req, res) => {
  // ... neschimbat
});
```

> [!NOTE]
> Detalii importante:
> * **`prefix` diferit pentru fiecare limitator**. Fără asta, ambele ar scrie sub aceleași chei în Redis și s-ar amesteca — contorul pe IP l-ar consuma pe cel pe email. Cu prefixe distincte, cheile devin **`rl:forgot:ip:192.168.1.5`** și **`rl:forgot:email:popescu@gmail.com`**, complet separate.

> * **`sendCommand` cu spread**. Așa se leagă `rate-limit-redis` de clientul `redis` **v4+**. Dacă folosești `ioredis` în loc, sintaxa e `sendCommand: (...args) => ioredisClient.call(...args)`.

> * **Cheia pentru email nu mai include prefixul manual** (`reset:`), fiindcă îl adaugă `RedisStore` prin opțiunea `prefix`.


# VERIFICARE

Pornești serverul și trimiți 4 cereri consecutive către `/forgot-password` cu același email. A patra ar trebui să returneze 429 cu mesajul configurat. Poți inspecta cheile direct:

```bash
    docker exec -it barbershop-redis redis-cli
    > KEYS rl:forgot:*
    > TTL rl:forgot:email:popescu@gmail.com
```

`TTL` îți arată câte secunde mai are de trăit contorul — util ca să confirmi că fereastra e cea configurată.


> [!IMPORTANT]
> **Ce se întâmplă dacă Redis pică**
> Comportamentul implicit al `express-rate-limit` la eroare de store este să **lase cererea să treacă** — aplicația rămâne funcțională, dar temporar fără limitare. E o alegere rezonabilă pentru un endpoint de resetare parolă (mai bine funcțional decât blocat). Dacă preferi opusul (blochează dacă nu poate verifica), adaugi:

```typescript
    passOnStoreError: false
```



