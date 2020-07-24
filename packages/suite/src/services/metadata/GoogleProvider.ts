import { AbstractMetadataProvider } from '@suite-types/metadata';
import GoogleClient from '@suite/services/google';

class GoogleProvider implements AbstractMetadataProvider {
    connected = false;
    client: GoogleClient;

    constructor(token?: string) {
        this.client = new GoogleClient(token);
    }

    async connect() {
        try {
            await this.client.authorize();
            console.warn('connected');
            this.connected = true;
            return true;
        } catch (error) {
            console.warn('connect error', error);
            return false;
        }
    }

    async disconnect() {
        try {
            await this.client.revoke();
            return true;
        } catch (_err) {
            return false;
        }
    }

    async getFileContent(file: string) {
        console.warn('getFileContent', file);

        const id = await this.client.getIdByName(`${file}.mtdt`);
        if (!id) return;

        const response = await this.client.get(
            {
                query: {
                    alt: 'media',
                },
            },
            id,
        );

        return Buffer.from(response, 'hex');
    }

    async setFileContent(file: string, content: Buffer) {
        const id = await this.client.getIdByName(`${file}.mtdt`);
        if (id) {
            await this.client.update(
                {
                    body: {
                        name: `${file}.mtdt`,
                        mimeType: 'text/plain;charset=UTF-8',
                    },
                },
                content.toString('hex'),
                id,
            );
        } else {
            await this.client.create(
                {
                    body: {
                        name: `${file}.mtdt`,
                        mimeType: 'text/plain;charset=UTF-8',
                        parents: ['appDataFolder'],
                    },
                },
                content.toString('hex'),
            );
        }
    }

    async getCredentials() {
        if (!this.client.token) return;
        const response = await this.client.getTokenInfo();
        return {
            type: 'google',
            token: this.client.token,
            user: response.user.displayName,
        } as const;
    }

    isLoading() {
        return false;
    }

    isConnected() {
        return this.connected;
    }
}

export default GoogleProvider;
