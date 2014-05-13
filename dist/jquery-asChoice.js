/*! jquery asChoice - v0.2.0 - 2014-05-09
* https://github.com/amazingSurge/jquery-asChoice
* Copyright (c) 2014 amazingSurge; Licensed GPL */
(function($) {
    "use strict";

    var AsChoice = $.asChoice = function(select, options) {
        this.select = select;
        this.$select = $(select);

        this.$options = this.$select.find('option');
        var meta = {};

        if (this.$options.length !== 0) {
            meta.status = {};
            meta.value = [];
            meta.multiple = this.$select.prop('multiple');

            $.each(this.$options, function(i, v) {
                meta.status[$(v).attr('value')] = {};
                meta.status[$(v).attr('value')].text = $(v).text();
                if ($(v).prop('selected')) {
                    meta.value.push($(v).attr('value'));
                }
            });
        }

        if (this.$select.attr('name')) {
            this.name = this.$select.attr('name');
        } else {
            this.name = options.name;
        }

        this.options = $.extend({}, AsChoice.defaults, options, meta);
        this.namespace = this.options.namespace;
        this.status = this.options.status;

        this.classes = {
            selected: this.namespace + '-selected',
            disabled: this.namespace + '-disabled',
            skin: this.namespace + '_' + this.options.skin
        };

        this.value = [];
        this.disabled = false;
        this.init();
    };

    AsChoice.prototype = {
        constuctor: AsChoice,
        init: function() {
            var self = this,
                tpl = '<li><span class="' + self.namespace + '-text"></span></li>';

            this.$select.css({
                display: 'none'
            });

            this.$wrap = $('<ul></ul>');
            this.$wrap.addClass(this.namespace);
            if (this.options.skin) {
                this.$wrap.addClass(this.classes.skin);
            }

            $.each(this.status, function(key, value) {
                var $tpl = $(tpl).data('value', key);

                if (typeof value === 'object') {
                    if (value.icon) {
                        $('<i></i>').addClass(value.icon).appendTo($tpl);
                    }
                    if (value.text) {
                        $tpl.find('span').text(value.text);
                    }

                } else {
                    $tpl.find('span').text(value.text);
                }

                $.each(self.value, function(i, v) {
                    if (v === key) {
                        $tpl.addClass(self.classes.selected);
                    }
                });

                self.$wrap.append($tpl);
            });

            this.$select.after(this.$wrap);

            // unselected a link
            this.$wrap.find('a').on('click.asChoice', function(e) {
                e.preventDefault();
            });

            if (this.options.multiple === true) {
                this.$wrap.delegate('li', 'click.asChoice touchstart.asChoice', function() {
                    if ($(this).hasClass(self.classes.selected)) {
                        self.set.call(self, $(this).data('value'), 'unselected');
                        return false;
                    } else {
                        self.set.call(self, $(this).data('value'), 'selected');
                        return false;
                    }

                });
                $.each(this.options.value, function(i, v) {
                    self.set.call(self, v, 'selected');
                });
            } else {
                this.$wrap.delegate('li', 'click.asChoice touchstart.asChoice', function() {
                    self.set($(this).data('value'), 'selected');
                });
                this.set(this.options.value[0], 'selected');
            }

            this.$select.trigger('asChoice::ready', this);
        },
        set: function(value, status) {
            var $option, $li,
                pos = $.inArray(value, this.value);

            if (this.disabled) {
                return;
            }

            if (this.options.multiple === true) {
                $.each(this.$options, function(i, v) {
                    if ($(v).attr('value') === value) {
                        $option = $(v);
                    }
                });
                $.each(this.$wrap.find('li'), function(i, v) {
                    if ($(v).data('value') === value) {
                        $li = $(v);
                    }
                });

                if (status === 'selected') {
                    this.value.push(value);
                    $li.addClass(this.classes.selected);
                    $option.prop('selected', true);

                } else {
                    this.value.splice(pos, 1);
                    $li.removeClass(this.classes.selected);
                    $option.prop('selected', false);
                }

                this.$select.trigger('asChoice::change', this);
                if (typeof this.options.onChange === 'function') {
                    this.options.onChange.call(this, this.value);
                }
            } else {
                if (value === this.value[0]) {
                    return false;
                }

                if (status !== 'selected') {
                    return false;
                }

                var self = this;
                $.each(this.$options, function(i, v) {
                    if ($(v).attr('value') === value) {
                        $(v).prop('selected', true);
                    } else {
                        $(v).prop('selected', false);
                    }
                });

                $.each(this.$wrap.find('li'), function(i, v) {
                    if ($(v).data('value') === value) {
                        $(v).addClass(self.classes.selected);
                        self.value[0] = value;

                    } else {
                        $(v).removeClass(self.classes.selected);
                    }
                });

                this.$select.trigger('asChoice::change', this);
                if (typeof this.options.onChange === 'function') {
                    this.options.onChange.call(this, this.value);
                }
            }
        },

        /*
            Public Method
         */

        val: function(value, status) {
            var self = this;

            if (value && status) {
                this.set(value, status);
            } else if (value) {
                if (typeof value === 'string') {
                    // value is string 
                    this.set(value, 'selected');
                } else {
                    // value is array
                    var options = this.$wrap.find('li');
                    $.each(options, function(key, li) {
                        var data = $(li).data('value');
                        if ($.inArray(data, value)) {
                            self.set(data, 'selected');
                        } else {
                            self.set(data, 'unselected');
                        }
                    });
                }
            } else {
                return this.value;
            }
        },
        enable: function() {
            this.disabled = false;
            this.$wrap.removeClass(this.classes.disabled);
            return this;
        },
        disable: function() {
            this.disabled = true;
            this.$wrap.addClass(this.classes.disabled);
            return this;
        },
        destroy: function() {
            this.$wrap.undelegate('.asChoice');
            this.$wrap.find('a').off('.asChoice');
            this.$wrap.remove();
        }
    };

    AsChoice.defaults = {
        skin: null,

        // status: {
        //     a: {
        //         text: 'on',
        //         icon: 'icon-1'
        //     },
        //     b: {
        //         text: 'off',
        //         icon: 'icon-2'
        //     },
        //     c: {
        //         text: 'default',
        //         icon: 'icon-3'
        //     }
        // },

        multiple: false,
        value: ['default'],
        name: null,

        namespace: 'asChoice'
        // onChange: function(instance) {

        // }
    };

    $.fn.asChoice = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'asChoice');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'asChoice')) {
                    $.data(this, 'asChoice', new AsChoice(this, options));
                }
            });
        }
    };
}(jQuery));