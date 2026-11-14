// @ts-nocheck
/*
    (PLEASE DO NOT DELETE THIS HEADER OR CREDIT!)

    Based on the comment widget by Ayano (https://virtualobserver.moe/)
    Flow: on-site form -> Google Forms -> Google Sheet -> comments shown on the site.

    Quartz 5 integration:
    - The CommentWidget component supplies <div id="c_widget"></div> on content pages.
    - This script is bundled through the component's afterDOMLoaded resource.
    - Quartz SPA navigation is handled through its document "nav" event.

    REQUIREMENTS
    - The Google Form must have questions titled EXACTLY:
      Name, Email, Website, Text, Page, Reply
    - The responses Sheet must be shared as "Anyone with the link: Viewer".
*/

(function () {
    'use strict';

    // REQUIRED values - keep them in quotes!
    const s_formId = '1FAIpQLSeWfvuC_DsO3RNcMqI0YRscqaglKEWHtYi3j6tgTwIDDOlSsQ';
    const s_nameId = '1043589293';
    const s_emailId = '1171504669';
    const s_websiteId = '298311877';
    const s_textId = '1564989888';
    const s_pageId = '1321010839';
    const s_replyId = '765136269';
    const s_sheetId = '1KIRN9S4OJdLCLOZGTKJqbPwV8SVidExfFcI6jX0F6Ag';

    // Timestamps
    const s_timezone = 7; // Your timezone (UTC+7 = 7, UTC-5 = -5, UTC+10:30 = 10.5)
    const s_daylightSavings = false;
    const s_dstStart = ['March', 'Sunday', 2, 2];
    const s_dstEnd = ['November', 'Sunday', 1, 2];

    // Misc
    const s_commentsPerPage = 5; // Exactly five top-level comments on each pagination page.
    const s_maxLength = 500;
    const s_maxLengthName = 16;
    const s_commentsOpen = true;
    const s_collapsedReplies = true;
    const s_longTimestamp = false;
    let s_includeUrlParameters = false;
    const s_fixRarebitIndexPage = false;

    // Word filter
    const s_wordFilterOn = false;
    const s_filterReplacement = '****';
    const s_filteredWords = [
        'fuck',
        'bitch',
        'bitches',
        'motherfucker',
        'sudicide',
        'shit',
        'nigga',
        'black guy'
    ];

    // Text
    const s_widgetTitle = '<span class="c-titleStar" aria-hidden="true">✦</span> Leave a comment';
    const s_nameFieldLabel = 'Name';
    const s_emailFieldLabel = 'Email (Optional)';
    const s_websiteFieldLabel = 'Website (Optional)';
    const s_textFieldLabel = 'Comment';
    const s_submitButtonLabel = 'Submit';
    const s_loadingText = 'Loading comments...';
    const s_noCommentsText = 'No comments yet';
    const s_closedCommentsText = 'Comments are closed temporarily';
    const s_errorText = 'Could not load comments right now. Please try again later.';
    const s_websiteText = 'Website';
    const s_replyButtonText = 'Reply';
    const s_replyingText = 'Replying to';
    const s_expandRepliesText = 'Show replies';
    const s_leftButtonText = 'Previous';
    const s_rightButtonText = 'Next';

    if (s_fixRarebitIndexPage) { s_includeUrlParameters = true; }

    function initialiseWidget() {
        const widget = document.getElementById('c_widget');
        if (!widget) {
            console.error('[Comment widget] Could not find an element with id="c_widget".');
            return;
        }

        widget.innerHTML = `
            <section id="c_inputDiv" class="c-widgetSection" aria-labelledby="c_widgetTitle">
                <form id="c_form" method="post" action="https://docs.google.com/forms/d/e/${s_formId}/formResponse"></form>
            </section>
            <section id="c_commentsSection" class="c-widgetSection" aria-label="Comments">
                <div id="c_container" aria-live="polite" aria-busy="true">${s_loadingText}</div>
            </section>
        `;

        const form = document.getElementById('c_form');
        if (s_commentsOpen) {
            form.innerHTML = `
                <h2 id="c_widgetTitle">${s_widgetTitle}</h2>
                <div id="c_nameWrapper" class="c-inputWrapper">
                    <label class="c-label c-nameLabel" for="entry.${s_nameId}">${s_nameFieldLabel}</label>
                    <input placeholder="Your name" class="c-input c-nameInput" name="entry.${s_nameId}" id="entry.${s_nameId}" type="text" maxlength="${s_maxLengthName}" autocomplete="name" required>
                </div>
                <div id="c_emailWrapper" class="c-inputWrapper">
                    <label class="c-label c-emailLabel" for="entry.${s_emailId}">${s_emailFieldLabel}</label>
                    <input placeholder="you@example.com" class="c-input c-emailInput" name="entry.${s_emailId}" id="entry.${s_emailId}" type="email" autocomplete="email">
                </div>
                <div id="c_websiteWrapper" class="c-inputWrapper">
                    <label class="c-label c-websiteLabel" for="entry.${s_websiteId}">${s_websiteFieldLabel}</label>
                    <input placeholder="https://example.com" class="c-input c-websiteInput" name="entry.${s_websiteId}" id="entry.${s_websiteId}" type="url" pattern="https://.*" autocomplete="url">
                </div>
                <div id="c_textWrapper" class="c-inputWrapper">
                    <label class="c-label c-textLabel" for="entry.${s_textId}">${s_textFieldLabel}</label>
                    <textarea placeholder="Write your comment..." class="c-input c-textInput" name="entry.${s_textId}" id="entry.${s_textId}" rows="4" maxlength="${s_maxLength}" required></textarea>
                </div>
                <input id="c_submitButton" name="c_submitButton" type="submit" value="${s_submitButtonLabel}" disabled>
            `;
        } else {
            form.textContent = s_closedCommentsText;
        }

        const container = document.getElementById('c_container');
        const submitButton = s_commentsOpen
            ? document.getElementById('c_submitButton')
            : document.createElement('button');

        let pageNum = 1;
        let amountOfPages = 1;
        let commentCount = 0;
        let allComments = [];
        let filteredWords = null;

        if (s_wordFilterOn) {
            const escapedWords = s_filteredWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            filteredWords = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'ig');
        }

        // Save the page path in the Google Form response so each website page has its own comments.
        let pagePath = window.location.pathname;
        if (s_includeUrlParameters) { pagePath += window.location.search; }
        if (s_fixRarebitIndexPage && pagePath === '/') { pagePath = '/?pg=1'; }

        const pageInput = document.createElement('input');
        pageInput.value = pagePath;
        pageInput.type = 'hidden';
        pageInput.id = `entry.${s_pageId}`;
        pageInput.name = pageInput.id;
        form.appendChild(pageInput);

        const replyingText = document.createElement('span');
        replyingText.id = 'c_replyingText';
        replyingText.hidden = true;
        form.appendChild(replyingText);

        const replyInput = document.createElement('input');
        replyInput.type = 'hidden';
        replyInput.id = `entry.${s_replyId}`;
        replyInput.name = replyInput.id;
        form.appendChild(replyInput);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!s_commentsOpen || submitButton.disabled) { return; }

            submitButton.disabled = true;
            submitButton.value = 'Submitting…';
            const body = new URLSearchParams(new FormData(form));

            // Google Forms does not expose a readable response with no-cors; the sheet is checked below.
            fetch(form.action, { method: 'POST', mode: 'no-cors', body })
                .then(function () { retryAfterSubmission(); })
                .catch(function () {
                    submitButton.disabled = false;
                    submitButton.value = s_submitButtonLabel;
                });
        });

        function retryAfterSubmission() {
            const previousCount = commentCount;
            let firstAttempt = true;

            function attempt(number) {
                loadComments(firstAttempt).then(function (count) {
                    firstAttempt = false;
                    if (count <= previousCount && number < 6) {
                        window.setTimeout(function () { attempt(number + 1); }, 2000);
                    } else {
                        submitButton.value = s_submitButtonLabel;
                    }
                });
            }

            window.setTimeout(function () { attempt(1); }, 1500);
        }

        function loadComments(clearForm) {
            submitButton.disabled = true;
            container.setAttribute('aria-busy', 'true');

            if (clearForm && s_commentsOpen) {
                form.reset();
                replyingText.hidden = true;
                replyingText.textContent = '';
                replyInput.value = '';
                pageInput.value = pagePath;
            }

            // Columns: A Timestamp, B Name, C Email, D Website, E Text, F Page, G Reply.
            // Email is deliberately not displayed; it is included in the sheet but excluded from public comment output.
            const safePath = pagePath.replace(/'/g, "''");
            const query = `SELECT A, B, D, E, G WHERE F = '${safePath}'`;
            const url = `https://docs.google.com/spreadsheets/d/${s_sheetId}/gviz/tq?tqx=out:csv&tq=${encodeURIComponent(query)}&headers=1&_=${Date.now()}`;

            return getSheet(url).then(function (csvText) {
                const rows = parseCSV(csvText.trim());
                if (!rows.length || rows[0][1] !== 'Name') {
                    throw new Error('Unexpected Google Sheet response. Check the response column order.');
                }

                allComments = [];
                for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
                    const row = rows[rowIndex];
                    const comment = {
                        Timestamp: row[0] || '',
                        Name: row[1] || '',
                        Website: row[2] || '',
                        Text: row[3] || '',
                        Reply: row[4] || ''
                    };
                    comment.Timestamp2 = comment.Timestamp;
                    if (comment.Name && comment.Text) { allComments.push(comment); }
                }

                commentCount = allComments.length;
                renderComments();
                submitButton.disabled = false;
                submitButton.value = s_submitButtonLabel;
                container.setAttribute('aria-busy', 'false');
                return commentCount;
            }).catch(function (error) {
                console.error('[Comment widget] Could not load comments:', error);
                container.textContent = s_errorText;
                container.setAttribute('aria-busy', 'false');
                submitButton.disabled = false;
                submitButton.value = s_submitButtonLabel;
                return commentCount;
            });
        }

        // CSV parser supports commas, escaped quotes and line breaks inside cells.
        function parseCSV(text) {
            const rows = [];
            let row = [];
            let field = '';
            let inQuotes = false;

            for (let index = 0; index < text.length; index++) {
                const character = text[index];
                if (inQuotes) {
                    if (character === '"' && text[index + 1] === '"') {
                        field += '"';
                        index++;
                    } else if (character === '"') {
                        inQuotes = false;
                    } else {
                        field += character;
                    }
                } else if (character === '"') {
                    inQuotes = true;
                } else if (character === ',') {
                    row.push(field);
                    field = '';
                } else if (character === '\n') {
                    row.push(field);
                    rows.push(row);
                    row = [];
                    field = '';
                } else if (character !== '\r') {
                    field += character;
                }
            }

            row.push(field);
            if (row.length > 1 || row[0] !== '') { rows.push(row); }
            return rows;
        }

        function getSheet(url) {
            return fetch(url, { cache: 'no-store' }).then(function (response) {
                if (!response.ok) { throw new Error('Could not access the Google Sheet.'); }
                return response.text();
            }).then(function (data) {
                if (!data) { throw new Error('The Google Sheet returned empty data.'); }
                return data;
            });
        }

        function formatDate(stringDate) {
            const parts = String(stringDate).split(' ');
            if (parts.length < 2) { return stringDate; }
            const [hourPart, minutePart, secondPart] = parts[1].split(':');
            let hours = Number.parseInt(hourPart, 10);
            if (!Number.isFinite(hours)) { return stringDate; }
            const ampm = hours >= 12 ? 'PM' : 'AM';
            if (hours > 12) { hours -= 12; }
            if (hours === 0) { hours = 12; }
            return `${parts[0]} at ${hours}:${minutePart}:${secondPart} ${ampm}`;
        }

        function applyWordFilter(value) {
            const text = String(value || '');
            return filteredWords ? text.replace(filteredWords, s_filterReplacement) : text;
        }

        function createComment(data, isReply) {
            const comment = document.createElement('article');
            const fullStamp = String(data.Timestamp || '');
            const timestamp = s_longTimestamp ? formatDate(fullStamp) : fullStamp.split(' ')[0];

            // Keep this ID format: existing Google Form replies refer to it.
            comment.id = `${data.Name}|--|${data.Timestamp2}`;
            comment.className = isReply ? 'c-reply' : 'c-comment';

            const heading = document.createElement('h3');
            heading.className = 'c-name';
            heading.textContent = applyWordFilter(data.Name);
            comment.appendChild(heading);

            const time = document.createElement('time');
            time.className = 'c-timestamp';
            time.textContent = timestamp;
            if (fullStamp) { time.dateTime = fullStamp; }
            comment.appendChild(time);

            if (data.Website && /^https:\/\//i.test(data.Website)) {
                const website = document.createElement('a');
                website.textContent = s_websiteText;
                website.href = data.Website;
                website.rel = 'nofollow noopener noreferrer';
                website.target = '_blank';
                website.className = 'c-site';
                comment.appendChild(website);
            }

            const message = document.createElement('p');
            message.className = 'c-text';
            message.textContent = applyWordFilter(data.Text);
            comment.appendChild(message);

            return comment;
        }

        function renderComments() {
            container.replaceChildren();
            const replies = allComments.filter(comment => comment.Reply);
            const mainComments = allComments.filter(comment => !comment.Reply).slice().reverse();

            amountOfPages = Math.max(1, Math.ceil(mainComments.length / s_commentsPerPage));
            pageNum = Math.min(Math.max(1, pageNum), amountOfPages);

            if (mainComments.length === 0) {
                const emptyState = document.createElement('p');
                emptyState.className = 'c-emptyState';
                emptyState.textContent = s_noCommentsText;
                container.appendChild(emptyState);
                return;
            }

            // Only render the five top-level comments for the selected page.
            // Replies belong to their parent and do not count toward the five-comment limit.
            const start = (pageNum - 1) * s_commentsPerPage;
            const pageComments = mainComments.slice(start, start + s_commentsPerPage);
            const renderedParents = new Map();

            pageComments.forEach(function (data) {
                const comment = createComment(data, false);
                const replyButton = document.createElement('button');
                replyButton.type = 'button';
                replyButton.className = 'c-replyButton';
                replyButton.textContent = s_replyButtonText;
                replyButton.addEventListener('click', function () {
                    openReply(comment.id);
                });
                comment.appendChild(replyButton);
                container.appendChild(comment);
                renderedParents.set(comment.id, comment);
            });

            // Attach replies only to parents visible on the current page.
            replies.forEach(function (replyData) {
                const parent = renderedParents.get(replyData.Reply);
                if (!parent) { return; }

                let replyContainer = parent.querySelector('.c-replyContainer');
                if (!replyContainer) {
                    replyContainer = document.createElement('div');
                    replyContainer.className = 'c-replyContainer';
                    replyContainer.hidden = s_collapsedReplies;
                    parent.appendChild(replyContainer);
                }
                replyContainer.appendChild(createComment(replyData, true));
            });

            // Add a single expand/collapse control per parent that has replies.
            container.querySelectorAll('.c-comment').forEach(function (parent) {
                const replyContainer = parent.querySelector('.c-replyContainer');
                if (!replyContainer) { return; }

                const replyButton = document.createElement('button');
                replyButton.type = 'button';
                replyButton.className = 'c-expandButton';
                replyButton.textContent = `${s_expandRepliesText} (${replyContainer.children.length})`;
                replyButton.setAttribute('aria-expanded', String(!replyContainer.hidden));
                replyButton.addEventListener('click', function () {
                    replyContainer.hidden = !replyContainer.hidden;
                    replyButton.setAttribute('aria-expanded', String(!replyContainer.hidden));
                    replyButton.textContent = `${replyContainer.hidden ? s_expandRepliesText : 'Hide replies'} (${replyContainer.children.length})`;
                });
                parent.appendChild(replyButton);
            });

            renderPagination(mainComments.length);
        }

        function renderPagination(totalComments) {
            if (amountOfPages <= 1) { return; }

            const pagination = document.createElement('nav');
            pagination.id = 'c_pagination';
            pagination.className = 'c-pagination';
            pagination.setAttribute('aria-label', 'Comment pages');

            const previous = document.createElement('button');
            previous.type = 'button';
            previous.className = 'c-paginationButton';
            previous.textContent = s_leftButtonText;
            previous.disabled = pageNum === 1;
            previous.addEventListener('click', function () { changePage(-1); });

            const pageStatus = document.createElement('span');
            pageStatus.className = 'c-pageStatus';
            pageStatus.textContent = `Page ${pageNum} of ${amountOfPages}`;
            pageStatus.setAttribute('aria-live', 'polite');

            const next = document.createElement('button');
            next.type = 'button';
            next.className = 'c-paginationButton';
            next.textContent = s_rightButtonText;
            next.disabled = pageNum === amountOfPages;
            next.addEventListener('click', function () { changePage(1); });

            pagination.append(previous, pageStatus, next);
            container.appendChild(pagination);
        }

        function changePage(direction) {
            const targetPage = pageNum + direction;
            if (targetPage < 1 || targetPage > amountOfPages) { return; }
            pageNum = targetPage;
            renderComments();

            const commentsSection = document.getElementById('c_commentsSection');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function openReply(id) {
            if (replyingText.hidden) {
                const parentName = id.split('|--|')[0];
                replyingText.textContent = `${s_replyingText} ${parentName}…`;
                replyingText.hidden = false;
                replyInput.value = id;
            } else {
                replyingText.textContent = '';
                replyingText.hidden = true;
                replyInput.value = '';
            }
            document.getElementById('c_inputDiv').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        loadComments(false);
    }

    // Quartz 5 dispatches a document-level "nav" event after SPA page content is swapped.
    // Reuse this widget for the new route and reload the Google Sheets thread by URL path.
    let activeWidget = null;
    let activeLocation = null;

    function currentLocationKey() {
        let path = window.location.pathname;
        if (s_includeUrlParameters) { path += window.location.search; }
        if (s_fixRarebitIndexPage && path === '/') { path = '/?pg=1'; }
        return path;
    }

    function tryInitialiseWidget() {
        const widget = document.getElementById('c_widget');
        if (!widget) {
            activeWidget = null;
            activeLocation = null;
            return;
        }

        const locationKey = currentLocationKey();
        if (widget === activeWidget && locationKey === activeLocation) { return; }

        activeWidget = widget;
        activeLocation = locationKey;
        initialiseWidget();
    }

    document.addEventListener('nav', tryInitialiseWidget);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitialiseWidget, { once: true });
    } else {
        tryInitialiseWidget();
    }
})();