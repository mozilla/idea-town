import app from 'ampersand-app';

import BaseView from './base-view';

export default BaseView.extend({
  template: `<li data-hook="show-detail" class="idea-card">
               <div class="idea-preview-image" data-hook="thumbnail">
                 <div data-l10n-id="experimentListInactiveHover"
                      class="hover-state show-when-inactive">Get Started</div>
                 <div data-l10n-id="experimentListActiveHover"
                      class="hover-state show-when-active">View Details</div>
               </div>
               <h2 data-hook="title"></h2>
               <p data-hook="description"></p>
             </li>`,

  bindings: {
    'model': {
      hook: 'title',
      type: function shortTitleWithFallback(el, model) {
        el.innerHTML = model.short_title || model.title;
      }
    },
    'model.description': {
      hook: 'description'
    },
    'model.thumbnail': {
      type: function setBgThumb(el, value) {
        el.setAttribute('style', `background-image: url(${value});`);
        return el;
      },
      hook: 'thumbnail'
    },
    'model.enabled': {
      type: 'booleanClass',
      hook: 'show-detail',
      name: 'active'
    }
  },

  events: {
    'click [data-hook=show-detail]': 'openDetailPage'
  },

  openDetailPage(evt) {
    evt.preventDefault();
    app.router.navigate('experiments/' + this.model.slug);
  }
});
