define([
  'core/js/adapt'
],function(Adapt) {

  Adapt.on('questionView:showFeedback', function(view) {

    var alertObject;
    var attributes = {};
    var classes = [];
    var config = Adapt.config.get('_tutor');
    config = config ? config : {
      "displayFeedback": "modal"
    }

    if (view.model.has('_isCorrect')) {
      // Attach specific classes so that feedback can be styled.
      if (view.model.get('_isCorrect')) {
        classes.push('is-correct');
      } else {
        if (view.model.has('_isAtLeastOneCorrectSelection')) {
          // Partially correct feedback is an option.
          if (view.model.get('_isAtLeastOneCorrectSelection')) {
            classes.push('is-partially-correct');
          } else {
            classes.push('is-incorrect');
          }
        } else {
          classes.push('is-incorrect');
        }
      }
    }

    // Add the extension/component type which triggered this.
    if (view.model.has('_component')) {
      classes.push('is-component is-' + view.model.get('_component').toLowerCase());
    } else if (view.model.has('_extension')) {
      classes.push('is-extension is-' + view.model.get('_extension').toLowerCase());
    }
    
    switch (config.displayFeedback) {
      case 'left':
      case 'right': {
        var qId = view.model.get('_id');
        var qElement = $(`div[data-adapt-id=${qId}]`)[0];
        var fComponent = $(`div[data-adapt-id=${qId}-feedback]`)[0] || document.createElement('div');
        var qAlign = config.displayFeedback === 'left' ? 'is-right' : 'is-left';
        var fAlign = config.displayFeedback === 'left' ? 'is-left' : 'is-right';
        
        $(qElement).removeClass(['is-full','is-left-','is-right']).addClass(qAlign);
        
        fComponent.classList.value=[];
        var onScreen = view.model.get('_onScreen');
        if (onScreen && onScreen._isEnabled) {
            fComponent.classList.add(onScreen._classes.trim() + '-before');
        }
        fComponent.classList.add('component');
        fComponent.classList.add('text');
        fComponent.classList.add('is-tutor-feedback');
        fComponent.classList.add(`${qId}-feedback`);
        fComponent.classList.add(`${fAlign}`);
        if (view.model.has('_isCorrect')) {
          // Attach specific classes so that feedback can be styled.
          if (view.model.get('_isCorrect')) {
            fComponent.classList.add('is-correct');
          } else {
            if (view.model.has('_isAtLeastOneCorrectSelection')) {
              // Partially correct feedback is an option.
              if (view.model.get('_isAtLeastOneCorrectSelection')) {
                fComponent.classList.add('is-partially-correct');
              } else {
                fComponent.classList.add('is-incorrect');
              }
            } else {
              fComponent.classList.add('is-incorrect');
            }
          }
        }
        $(fComponent).attr('data-adapt-id', `${qId}-feedback`);
        fComponent.innerHTML = `
          <div class="component__inner text__inner">
            <div class="component__header text__header">
              <div class="component__header-inner text__header-inner">
                <div class="component__title text__title">
                  <div class="js-heading">
                    <div id="${qId}-feedback-heading" class="js-heading-inner" role="heading" aria-level="4">
                      <span class="aria-label">
                          ${view.model.get('feedbackTitle')}
                      </span>
                    </div>
                  </div>
                  <h4 class="component__title-inner text__title-inner" aria-hidden="true">
                    ${view.model.get('feedbackTitle')}
                  </h4>
                </div>
                <div class="component__body text__body">
                  <div class="component__body-inner text__body-inner">
                    ${view.model.get('feedbackMessage')}
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        if (fAlign === 'is-right') {
          $(qElement).after(fComponent);
        } else if (fAlign === 'is-left') {
          $(qElement).before(fComponent);
        }
        if (onScreen && onScreen._isEnabled) {
          _.delay(
            () => {
              fComponent.classList.add(onScreen._classes.trim() + '-after');
            },
            100
          );
        }
        break;
      }
      case 'modal': 
      default: {
        alertObject = {
          title: view.model.get('feedbackTitle'),
          body: view.model.get('feedbackMessage')
        };

        // Add the _id property as attribute.
        attributes['data-adapt-id'] = view.model.get('_id');
        
        alertObject._classes = classes.join(' ');
        alertObject._attributes = attributes;

        Adapt.once('notify:closed', function() {
          Adapt.trigger('tutor:closed', view, alertObject);
        });

        Adapt.trigger('notify:popup', alertObject);

        Adapt.trigger('tutor:opened', view, alertObject);
        break;
      }
    }

  });

});
