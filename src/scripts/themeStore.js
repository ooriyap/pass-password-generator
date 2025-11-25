export default {
    mode: 'light',

    init() {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
            this.mode = localStorage.getItem('theme');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.mode = 'dark';
        }

        this.apply();
    },

    toggle() {
        this.mode = this.mode === 'light' ? 'dark' : 'light';
        this.apply();
        localStorage.setItem('theme', this.mode);
    },

    apply() {
        if (this.mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
