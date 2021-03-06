import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import ContactView from 'app/views/contact_view';

const RolodexView = Backbone.View.extend({
  initialize: function(options) {
    // this.$el is now $('main')

    // Keep track of important sub-elements
    this.listElement = this.$('#contact-cards');
    this.modalElement = this.$('#contact-details');

    // Generate & track Contact Cards (list view)
    this.contactCards = [];
    this.contactTemplate = _.template($('#tmpl-contact-card').html());

    // Create contactCards for each Contact (this.model is the Rolodex Collection of Contacts)
    this.model.forEach(function(contact) {
      this.addContactCard(contact);
    }, this);

    // Listen for added/removed Contacts in Rolodex. For any: generate new card or remove card, re-render view
    this.listenTo(this.model, 'add', this.addContactCard);
    this.listenTo(this.model, 'remove', this.removeContactCard);
    this.listenTo(this.model, 'update', this.render);

    // Keep track of modal element/template
    this.modalSection = this.$('#contact-details');
    this.modalTemplate = _.template($('#tmpl-contact-details').html());
  },

  render: function() {
    // Reset list to empty; hide modal
    this.modalSection.hide();
    this.listElement.empty();

    // Render each card, add to <ul>
    this.contactCards.forEach(function(card) {
      card.render();

      this.listElement.append(card.$el);
    }, this);

    return this;
  },

  events: {
    'click #contact-details': 'suppressModalHide',
    'click .btn-edit': 'editClick'
  },

  addContactCard: function(contact) {
    // Make new card
    var card = new ContactView({
      model: contact,
      template: this.contactTemplate
    });

    // Listen for any clicks on this card
    this.listenTo(card, 'contact:click', this.showModal);

    // Add card to contactCards array
    this.contactCards.push(card);
  },

  removeContactCard: function(contact) {
    // console.log("in removeContactCard. this.contactCards is: " + this.contactCards); // NOTE: log

    // Remove contactCard for deleted contact
    this.contactCards = _.reject(this.contactCards, function(card) {
      return card.model == contact;
    });

    // console.log("After _.reject, this.contactCards is: " + this.contactCards); // NOTE: log
  },

  showModal: function(contact) {
    // console.log('This will SHOW MODAL >--------<'); // NOTE: log

    // Set contact instance variable so it can be used later by edit:click event
    this.contact = contact;

    // console.log("showModal this.contact.name: " + this.contact.name); // NOTE: log
    // console.log("showModal this.contact: " + this.contact); // NOTE: log

    // Set the needed values for template
    var html = this.modalTemplate({
      name: contact.name,
      email: contact.email,
      phone: contact.phone
    });

    // Set the modalElement html to the html generated by template & show modal
    this.modalElement.html(html);
    this.modalElement.show();

    return this;
  },

  suppressModalHide: function(event) {
    // Prevent a click on the modal from bubbling up (which would trigger hideModal even when clicking *on* the modal)
    event.stopPropagation();
  },

  editClick: function(event) {
    // console.log("editClick this.contact.name " + this.contact.name ); // NOTE: log
    // console.log("editClick this.model" + this.model); // NOTE: log

    // Trigger 'edit:click' event & pass this.contact from modal up to ApplicationView (for editContact)
    this.trigger('edit:click', this.contact);
  }
});

export default RolodexView;
