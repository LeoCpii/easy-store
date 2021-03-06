import { Firebase } from "./firebase.lib";
import * as fs from 'fs';

export class File {
    private get storage() {
        return new Firebase();
    }

    private ext(base: string): string {
        return base.split(/^data:([A-Za-z-+/]+)/)[1].split('/')[1];
    }

    private generatePath(arr: string[]): string {
        const path = arr.reduce((total, current, index) => total += `${current}\/`, '');
        return path.substring(0, path.length - 1);
    }

    private createPublicFileURL(storageName: string) {
        return `http://storage.googleapis.com/${this.storage.bucketName}/${storageName}`;
    }

    private save(data: string, path: string): void {
        fs.writeFileSync(path, data, { encoding: 'base64' });
    }

    private exclude(path: string): void {
        fs.unlink(path, (error) => { });
    }

    public async upload(email: string, app: string, base64: string, slug: string) {
        try {
            const ext = this.ext(base64);
            const name = `${slug}.${ext}`;
            const data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');

            const path = this.generatePath([email, app, name]);

            this.storage.upload(path, data).then(() => this.exclude(name));

            return this.createPublicFileURL(path);
        } catch (error) {
            console.log('upload', error);
        }
    }
}