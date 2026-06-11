// Configuration du worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.addEventListener("DOMContentLoaded", () => {
    const previews = document.querySelectorAll('canvas.pdf-preview');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const canvas = entry.target;
            const pdfUrl = canvas.dataset.pdf;
            const parent = canvas.parentElement; // Le conteneur avec .pdf-preview-container
            
            observer.unobserve(canvas);
            if (!pdfUrl) return;

            // Au lieu de : pdfjsLib.getDocument(pdfUrl)
            // On lui passe un objet de configuration :
            pdfjsLib.getDocument({
                url: pdfUrl,
                disableAutoFetch: true,  // Empêche de télécharger tout le reste du PDF en arrière-plan
                disableStream: true      // Force le traitement par morceaux choisis si le serveur le permet
            }).promise.then(pdf => {
                return pdf.getPage(1);
            }).then(page => {
                const ctx = canvas.getContext('2d');
                const baseViewport = page.getViewport({ scale: 1.0 });
                const expectedWidth = parent.clientWidth || 300;
                
                const scale = (expectedWidth / baseViewport.width) * 1.5; 
                const viewport = page.getViewport({ scale: scale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                
                page.render(renderContext).promise.then(() => {
                    canvas.classList.add('ready');
                    parent.classList.add('loaded');
                });

            }).catch(err => {
                console.warn("Fichier PDF non trouvé ou inaccessible : " + pdfUrl);
                
                // On coupe l'effet Skeleton
                parent.classList.add('loaded'); 
                
                // On injecte le placeholder universel
                canvas.outerHTML = `
                    <div class="pdf-fallback-placeholder">
                        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>`;
            });
        });
    }, {
        rootMargin: "300px"
    });

    previews.forEach(canvas => observer.observe(canvas));
});
