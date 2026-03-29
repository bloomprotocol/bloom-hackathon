import { metadata } from './page.meta';
import ApiKeysContent from './api-keys-content';

export { metadata };

export default function ApiKeysPage() {
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-[url('https://statics.bloomprotocol.ai/images/body-light.jpg')] bg-cover bg-center bg-no-repeat -z-10" />

      {/* Content */}
      <div className="min-h-[calc(100vh-56px)] desktop:min-h-[calc(100vh-84px)] relative">
        <ApiKeysContent />
      </div>
    </>
  );
}
