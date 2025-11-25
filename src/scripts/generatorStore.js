export default {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    exclude: '',
    password: '',
    strength: 0,
    copied: false,

    init() {
        // Load settings from localStorage
        if (typeof localStorage !== 'undefined' && localStorage.getItem('asp_settings')) {
            try {
                const settings = JSON.parse(localStorage.getItem('asp_settings'));
                this.length = parseInt(settings.length) || 16;
                this.uppercase = settings.uppercase ?? true;
                this.lowercase = settings.lowercase ?? true;
                this.numbers = settings.numbers ?? true;
                this.symbols = settings.symbols ?? true;
                this.exclude = settings.exclude || '';
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        }

        this.generate();

        // Watchers
        this.$watch('length', () => this.saveAndGenerate());
        this.$watch('uppercase', () => this.validateSaveGenerate());
        this.$watch('lowercase', () => this.validateSaveGenerate());
        this.$watch('numbers', () => this.validateSaveGenerate());
        this.$watch('symbols', () => this.validateSaveGenerate());
        this.$watch('exclude', () => this.saveAndGenerate());
    },

    validateSaveGenerate() {
        // Prevent deselecting all
        if (!this.uppercase && !this.lowercase && !this.numbers && !this.symbols) {
            this.lowercase = true;
        }
        this.saveAndGenerate();
    },

    saveAndGenerate() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('asp_settings', JSON.stringify({
                length: this.length,
                uppercase: this.uppercase,
                lowercase: this.lowercase,
                numbers: this.numbers,
                symbols: this.symbols,
                exclude: this.exclude
            }));
        }
        this.generate();
    },

    generate() {
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let chars = '';
        if (this.lowercase) chars += lowerChars;
        if (this.uppercase) chars += upperChars;
        if (this.numbers) chars += numberChars;
        if (this.symbols) chars += symbolChars;

        // Remove excluded
        if (this.exclude) {
            const excludeSet = new Set(this.exclude.split(''));
            chars = chars.split('').filter(c => !excludeSet.has(c)).join('');
        }

        if (!chars) {
            this.password = '';
            this.strength = 0;
            return;
        }

        let password = '';
        const array = new Uint32Array(this.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < this.length; i++) {
            password += chars[array[i] % chars.length];
        }

        this.password = password;
        this.calculateStrength(chars.length);
    },

    calculateStrength(poolSize) {
        if (!this.password) {
            this.strength = 0;
            return;
        }
        // Entropy = Length * log2(PoolSize)
        const entropy = this.length * Math.log2(poolSize);
        // Normalize: 128 bits = 100%
        this.strength = Math.min(100, (entropy / 128) * 100);
    },

    copy() {
        if (!this.password) return;
        navigator.clipboard.writeText(this.password).then(() => {
            this.copied = true;
            setTimeout(() => this.copied = false, 2000);
        });
    },
    
    setAmbiguous() {
        this.exclude = 'Il1O0';
        // Watcher will trigger generate
    }
}
