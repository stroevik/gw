// @name          [Special] Ip archive
// @version       1.0.3
// @author        Bl(a)de

$(document).ready(function() {
    var Settings = function () {
        this.root = this.getRoot();
        this.store = this.getStore(this.root.localStorage);
        this.head = this.getHead();
        this.body = this.getBody();
        this.usersStoreKey = 'isksUsers';
    }

    Settings.prototype = {
        getRoot: function(){
            return typeof unsafeWindow !== "undefined" ? unsafeWindow : window
        },

        getStore: function(storage){
            return new Disk(storage);
        },

        getHead: function () {
            return $('head');
        },

        getBody: function () {
            return $('body');
        },

        isLoadJQuery: function(){
            return typeof this.root.jQuery !== "undefined";
        },

        includeBS: function(){
            this.head.prepend('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">').prepend('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">');
            $.getScript("https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js", function () {
                $.getScript("https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js");
            });
        },

        init: function(){
            if (!this.isLoadJQuery())
                return;
            this.includeBS();
        }
    }

    var Disk = function (storage) {
        this.storage = storage;

        this.get = function (key) {
            return this.storage.getItem(key);
        };

        this.set = function (key, val) {
            this.storage.setItem(key, val);
        };
    };

    var Ajax = function () {
        this.init = function (url, method, params, dataType, initLoader, onsuccess, onfailure) {
            if (url === '') return;
            if (initLoader) $('#page-loader').show();
            $.ajax({
                url: url,
                method: method,
                data: params,
                dataType: dataType,
                success: onsuccess,
                error: onfailure,
                complete: function () {
                    if (initLoader) $('#page-loader').hide();
                }
            });
        }
    };

    var Notify = function () {
        this.show = function (message, context) {
            var box = $('#notify-container');
            var alertBox = box.find('.alert');
            alertBox.addClass('bg-' + context);
            alertBox.html(message);
            box.stop().fadeOut(0).fadeIn('slow');
            setTimeout(function () {
                box.fadeOut(500);
            }, 2000);
            setTimeout(function () {
                alertBox.removeClass('bg-' + context);
                alertBox.html('');
            }, 2800);
        };
    }

    var Templater = function(){

        this.addPageLoader = function (el) {
            var loader = $('<div/>', {
                id: 'page-loader',
            }).css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.45)',
                zIndex: 9999,
                display: 'none'
            });
            loader.append($('<i/>', {
                class: 'fa fa-spinner fa-pulse fa-3x fa-fw'
            }).css({
                position: 'fixed',
                top: '50%',
                left: '50%',
                margin: '-28px 0 0 -28px'
            }));
            el.append(loader);
        };

        this.addNotifyBox = function (el) {
            el.append($('<div>', {
                id: 'notify-container',
                //class: 'd-none',
                html: $('<div/>', {
                    class: 'alert'
                })
            }).css({
                position: 'fixed',
                bottom: '15px',
                right: '15px',
                display: 'none',
                fontWeight: 'bold',
                color: '#fff',
                zIndex: 9999
            }));
        };

        this.addWorkModal = function(el){
            $('<div/>', {
                id: 'work-panel',
                class: 'modal fade',
                tabIndex: '-1',
                role: 'dialog',
                "aria-hidden": 'true',
                "data-backdrop": 'static',
                "data-keyboard": 'false',
                html: $('<div/>', {
                    class: 'modal-dialog modal-lg',
                    role: 'document',
                    html: $('<div/>', {
                        class: 'modal-content',
                        html: $('<div/>', {
                            class: 'modal-header p-2 bg-info',
                            html: '<span class="modal-title"></span><button type="button" class="close" data-dismiss="modal" aria-label="Close" style="font-size: 1rem;"><span aria-hidden="true">&times;</span></button>'
                        }).add($('<div/>', {
                            class: 'modal-body text-center',
                            html: '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>'
                        })).add($('<div/>', {
                            class: 'modal-footer d-none'
                        }))
                    })
                })
            }).appendTo(el);
            var intersectionLink = $('<a>', {
                id: 'show-intersections-modal',
                class: 'dropdown-item bg-danger text-white rounded border-dark mb-1',
                href: '#',
                html: '<i class="fa fa-users"></i> Пересечения'
            }).css({
                fontSize: '0.85rem',
                padding: '0.25rem 0.5rem'
            });
            /*var whoisesLink = $('<a>', {
                id: 'show-whoises-modal',
                class: 'dropdown-item bg-danger text-white rounded border-dark mb-2',
                href: '#',
                html: '<i class="fa fa-globe"></i> Хуизатор'
            }).css({
                fontSize: '0.85rem',
                padding: '0.25rem 0.5rem'
            });*/
            var btnGroup = $('<div/>', {
                class: 'btn-group',
                role: 'group',
                html: $('<button/>', {
                    id: 'wrench-group-show',
                    type: 'button',
                    class: 'btn btn-info dropdown-toggle',
                    "data-toggle": 'dropdown',
                    "aria-haspopup": 'true',
                    "aria-expanded": 'false',
                    html: '<i class="fa fa-wrench"></i>'
                }).add($('<div/>', {
                    class: 'dropdown-menu p-0 border-0',
                    "aria-labelledby": 'wrench-group-show',
                    html: intersectionLink //.add(whoisesLink)
                }).css({ background: 'none' }))
            }).css({
                position: 'fixed',
                bottom: '15px',
                left: '15px'
            }).appendTo(el);
        };

        this.addModalTitle = function (el, content) {
            el.find('.modal-title').html(content);
        },

            this.addHtmlCard = function(parent, id, title){
                var content = $('<div/>', {
                    id: id,
                    class: 'card',
                    html: $('<div>', {
                        class: 'card-header py-1 px-2 text-left',
                        html: title
                    }).add($('<div/>', {
                        class: 'card-body py-1 px-2'
                    }))
                });
                parent.html(content);
            };

        this.addUsersAddForm = function(el){
            var field = $('<input/>', {
                id: 'add-user-id',
                class: 'form-control my-0',
                type: 'text',
                placeholder: 'ID персонажа'
            }).css({borderColor: '#ced4da', fontSize: '0.75rem'});
            var btn = $('<button/>', {
                class: 'btn btn-info add-user-in-list',
                html: '<i class="fa fa-plus"></i> Добавить'
            }).css({fontSize: '0.75rem'});
            var form = $('<div/>', {
                id: 'user-add-box',
                class: 'row my-1',
                html: $('<div/>', {
                    class: 'col',
                    html: $('<div/>', {
                        class: 'input-group input-group-sm',
                        html: field.add($('<div/>', {
                            class: 'input-group-append',
                            html: btn
                        }))
                    })
                })
            });
            el.html(form);
            field.on('keyup', function () {
                var val = $(this).val();
                var cl_val = val.replace(/[^0-9\.]+/, '');
                if (val !== cl_val) $(this).val(cl_val);
            });
        };

        this.addUsersFilterList = function (el) {
            el.append($('<ul>', {
                id: 'users-filter-list',
                class: 'my-2'
            }).css({
                listStyleType: 'none',
                padding: 0
            }));
        };

        this.addUserItemIntoFilterList = function (el, data) {
            el.append($('<li>', {
                class: 'font-weight-bold p-1 my-1',
                html: $('<div/>', {
                    class: 'row align-items-center',
                    html: $('<div/>', {
                        class: 'col',
                        html: $('<div/>', {
                            class: 'form-check text-left text-info',
                            html: $('<input/>', {
                                id: 'cbu_' + data.id,
                                type: 'checkbox',
                                class: 'form-check-input check-user-in-filter'
                            }).val(data.id).css({ marginTop: '0.15rem'}).add($('<label/>', {
                                class: 'form-check-label d-block',
                                for: 'cbu_' + data.id,
                                text: data.name
                            }).css({ cursor: 'pointer'}))
                        })
                    }).add($('<div/>', {
                        class: 'col-auto',
                        html: $('<button/>', {
                            class: 'remove-user-from-filter btn btn-sm btn-danger p-1',
                            html: '<i class="fa fa-remove"></i>'
                        }).data('uid', data.id).css({fontSize: '0.75rem'})
                    }))
                })
            }).css({border: '1px dashed rgba(0,0,0,0.05)', borderRadius: '2px'}).hover(function (){
                $(this).css({ backgroundColor: 'rgba(0,255,0,0.05)'});
            }, function () {
                $(this).css({ backgroundColor: 'unset'});
            }));
        };

        this.addUsersIntoFilterList = function (el, data) {
            var _this = this;
            el.html('');
            var counter = 0;
            $.each(data, function (i, val) {
                _this.addUserItemIntoFilterList(el, val);
                counter++;
            });
            if (counter > 0) {
                el.show();
            } else {
                el.hide();
            }
        };

        this.addPeriodsMultiselect = function(el){
            var periods = $('.wb > select[name=period]');
            if (typeof periods === "undefined")
                return;
            var select = $('<select/>', {
                id: 'periods-select',
                class: 'custom-select p-1 my-1',
                multiple: true
            }).prop('size', 8);
            $.each(periods.find('option'), function (i, val) {
                select.append($('<option>', {
                    value: val.value,
                    text: val.text,
                    selected: i === 0
                }));
            });
            el.html(select);
            el.append($('<small/>', {
                class: 'text-danger',
                text: '* можно указать несколько значений через Ctrl или Shift'
            }));
        };

        this.addIntervalField = function (el) {
            var field = $('<input/>', {
                id: 'analise-time-interval',
                class: 'form-control my-0 text-center',
                type: 'text',
                value: 5,
                maxLength: 3
            }).css({borderColor: '#ced4da', fontSize: '0.75rem'}).attr('size', 3);
            var form = $('<div/>', {
                class: 'input-group input-group-sm',
                html: $('<div/>', {
                    class: 'input-group-prepend',
                    html: $('<span/>', {
                        class: 'input-group-text',
                        text: 'Интервал'
                    }).css({fontSize: '0.75rem'})}).add(field).add($('<div/>', {
                    class: 'input-group-append',
                    html: $('<span/>', {
                        class: 'input-group-text',
                        text: 'мин.'
                    }).css({fontSize: '0.75rem'})
                }))
            });
            el.html(form);
            field.on('keyup', function () {
                var val = $(this).val();
                var cl_val = val.replace(/[^0-9\.]+/, '');
                if (val !== cl_val) $(this).val(cl_val);
            });
            field.on('blur', function () {
                var val = $(this).val();
                if (val === '' || val <= 0) $(this).val(5);
            });
        };

        this.addSubmitButton = function(el){
            el.append( $('<button>', {
                id: 'start-analise-btn',
                class: 'btn btn-danger btn-sm ml-2',
                html: '<i class="fa fa-arrow-right"></i> Анализировать'
            }).css({fontSize: '0.75rem'}));
        };

        this.addModalContent = function(el){
            el.html($('<div/>', {
                class: 'row no-gutters',
                html: $('<div/>', {
                    id: 'users-card-box',
                    class: 'col-sm-6 pr-sm-1 mb-2'
                }).add($('<div/>', {
                    id: 'periods-card-box',
                    class: 'col-sm-6 pl-sm-1 mb-2'
                }))
            }));
            el.append($('<div/>', {
                class: 'row mt-2 no-gutters',
                html: $($('<div/>', {
                    class: 'col'
                })).add($('<div/>', {
                    id: 'time-interval-box',
                    class: 'col-auto text-sm-center pb-2'
                })).add($('<div/>', {
                    id: 'submit-button-box',
                    class: 'col-md-auto text-md-right text-sm-center pb-2'
                }))
            }));
            el.append($('<div/>', {
                class: 'form-group m-0',
                html: $('<textarea>', {
                    id: 'analise-result',
                    class: 'form-control d-none'
                }).attr('readonly', true).css({
                    fontSize: '12px',
                    minHeight: '40vh'
                })
            }));
            el.append($('<div/>', {
                id: 'hide-ip-checker-box',
                class: 'text-left d-none mt-2',
                html: $('<button/>', {
                    id: 'hide-show-ip-btn',
                    class: 'btn btn-warning btn-sm showed mx-1',
                    html: '<i class="fa fa-eye-slash"> Скрыть IP</i>'
                }).add('<button/>', {
                    id: 'copy-log-to-board-btn',
                    class: 'btn btn-info btn-sm mx-1',
                    html: '<i class="fa fa-copy"> Копировать пересечения</i>'
                })
            }));
        }
    };

    var Application = function(templater, settings, storage){
        this.init = function (body) {
            templater.addPageLoader(body);
            templater.addNotifyBox(body);
            templater.addWorkModal(body);
            if (storage.get(settings.usersStoreKey) === null) {
                storage.set(settings.usersStoreKey, JSON.stringify([]));
            }
        }

        this.intersectionsBuild = function () {
            templater.addModalTitle($('#work-panel'), '<i class="fa fa-search"></i> Поиск пересечений');
            templater.addModalContent($('#work-panel').find('.modal-body'));
            templater.addHtmlCard($('#users-card-box'), 'users-card', 'Персонажи');
            templater.addUsersAddForm($('#users-card').find('.card-body'));
            templater.addUsersFilterList($('#users-card').find('.card-body'));
            templater.addHtmlCard($('#periods-card-box'), 'periods-card', 'Период');
            templater.addPeriodsMultiselect($('#periods-card').find('.card-body'));
            templater.addIntervalField($('#time-interval-box'));
            templater.addSubmitButton($('#submit-button-box'));
            templater.addUsersIntoFilterList($('#users-filter-list'), JSON.parse(storage.get(settings.usersStoreKey)));
        }

        /*this.whoisesBuild = function () {
            templater.addModalTitle($('#work-panel'), '<i class="fa fa-globe"></i> Хуизатор');
        }*/
    };

    var DataHelper = function(){
        this.checkIssetItemInObjectsList = function(list, key, val) {
            if (typeof list === 'object'){
                for (var i = 0; i < list.length; i++){
                    if (typeof list[i] === 'object' && key in list[i] && list[i][key] === val) {
                        return true;
                    }
                }
            }
            return false;
        };

        this.removeItemFromObjectsList = function(list, key, val) {
            if (typeof list === 'object'){
                for (var i = 0; i < list.length; i++){
                    if (typeof list[i] === 'object' && key in list[i] && list[i][key] === val) {
                        list.splice(i, 1);
                        return list;
                    }
                }
            }
            return list;
        };
    };

    var Analizer = function(){
        this.users = [];
        this.usersNames = [];
        this.periods = [];
        this.interval = 0;
        this.user_1 = null;
        this.user_2 = null;
        this.currentPeriod = null;
        this.currentUser = null;
        this.userLog_1 = [];
        this.userLog_2 = [];
        this.intersectionData = [];

        this.init = function (users, periods, interval) {
            this.users = users;
            this.periods = periods;
            this.interval = parseInt(interval) * 60 * 1000;
            this.usersNames = [];
            this.user_1 = null;
            this.user_2 = null;
            this.currentPeriod = null;
            this.currentUser = null;
            this.userLog_1 = [];
            this.userLog_2 = [];
            this.intersectionData = [];
            $('#page-loader').show();
        };

        this.setUsersNames = function (names) {
            this.usersNames = names;
        };

        this.start = function () {
            if (this.users.length === 2 && this.periods.length > 0 && this.interval > 0) {
                this.user_1 = this.users[0];
                this.user_2 = this.users[1];
                this.currentPeriod = this.periods.shift();
                this.currentUser = 1;
                this.loadData();
            } else {
                $('#page-loader').hide();
                this.showParseResult(true);
            }
        };

        this.loadData = function () {
            var _this = this;
            setTimeout(function() {
                var userID = (_this.currentUser === 1) ? _this.user_1 : _this.user_2;
                new Ajax().init(
                    'http://www.gwars.ru/special.iparchive.php',
                    'post',
                    {
                        check: userID,
                        period: _this.currentPeriod
                    },
                    'html',
                    false,
                    function (r) {
                        _this.parseData(r, userID);
                    },
                    function () {
                        new Notify().show('Что-то пошло не так!', 'danger');
                        $('#page-loader').hide();
                    }
                );
            }, 300);
        };

        this.parseData = function(r, userID) {
            var dataFind = [];
            var res = $($.parseHTML(r)).find('center:contains("Результат для ")').parent().html();
            if (typeof res !== "undefined"){
                var regIP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s?(\\d{2}:\\d{2}:\\d{2})?[^>]+>(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})', 'ig');
                var data = res.match(regIP);
                if (data !== null) {
                    var item, parseData, ts, date, ip;
                    regIP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s?(\\d{2}:\\d{2}:\\d{2})?[^>]+>(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})', 'i');
                    while(data.length > 0){
                        item = data.shift();
                        parseData = regIP.exec(item);
                        if (typeof parseData === 'object' && parseData !== null) {
                            ip = parseData[3];
                            date = parseData[1];
                            if (parseData[2] !== undefined) {
                                date += ' ' + parseData[2];
                            }
                            ts = this.getDateTs(date);
                            dataFind.push({
                                used: false,
                                id: userID,
                                ts: ts,
                                date: date,
                                ip: ip
                            });
                        }
                    }
                }
            } else {
                new Notify().show('Страница логов недоступна!', 'danger');
                $('#page-loader').hide();
                return false;
            }
            res = null;
            if (dataFind.length !== 0) {
                if (this.currentUser === 1) {
                    this.userLog_1 = dataFind;
                    this.currentUser = 2;
                    this.loadData();
                } else {
                    this.userLog_2 = dataFind;
                    this.checkUsersIntersection();
                    this.start();
                }
                dataFind = null;
            } else {
                this.start();
            }
        };

        this.getDateTs = function (dt) {
            var res = 0;
            if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(dt)) {
                var parts = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/.exec(dt);
                if (parts !== null) {
                    res = new Date(
                        parseInt(parts[1]),
                        parseInt(parts[2]) - 1,
                        parseInt(parts[3]),
                        parseInt(parts[4]),
                        parseInt(parts[5]),
                        parseInt(parts[6])
                    ).getTime();
                }
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(dt)) {
                var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dt);
                if (parts !== null) {
                    res = new Date(
                        parseInt(parts[1]),
                        parseInt(parts[2]) - 1,
                        parseInt(parts[3]),
                        0,
                        0,
                        0
                    ).getTime();
                }
            }
            return res;
        };

        this.checkUsersIntersection = function () {
            var longLog_1 = this.userLog_1.length;
            var longLog_2 = this.userLog_2.length;
            if (longLog_1 > 0 && longLog_2 > 0 && this.interval > 0) {
                var log_1 = (longLog_1 < longLog_2) ? this.userLog_1 : this.userLog_2;
                var log_2 = (longLog_1 < longLog_2) ? this.userLog_2 : this.userLog_1;
                var ts_1, ts_2, ip_1, ip_2;
                for (var i = 0; i < log_1.length; i++) {
                    ts_1 = log_1[i].ts;
                    ip_1 = log_1[i].ip;
                    for (var j = 0; j < log_2.length; j++) {
                        if (log_2[j].used === true) continue;
                        ts_2 = log_2[j].ts;
                        ip_2 = log_2[j].ip;
                        if ((Math.abs(ts_1 - ts_2) <= this.interval) && ip_1 === ip_2) {
                            this.intersectionData.push({
                                user_1: log_1[i],
                                user_2: log_2[j]
                            });
                            log_2[j].used = true;
                            break;
                        }
                    }
                }
                log_1 = null;
                log_2 = null;
            }
            this.userLog_1 = null;
            this.userLog_2 = null;
        };

        this.getUserName = function (id) {
            var key = 'u' + id;
            if (key in this.usersNames) {
                return this.usersNames[key];
            }
            return '';
        };

        this.showParseResult = function (fromIP) {
            var _this = this;
            if (this.intersectionData.length > 0) {
                var content = '', item = '', user_1, user_2;
                $.each(this.intersectionData, function (i, val) {
                    user_1 = (val.user_1.ts < val.user_2.ts) ?  val.user_1 : val.user_2;
                    user_2 = (val.user_1.ts < val.user_2.ts) ?  val.user_2 : val.user_1;
                    item = user_1.date + ' ';
                    if (fromIP) item += user_1.ip + '  ';
                    item +=  _this.getUserName(user_1.id) + '\n';
                    item += user_2.date + ' ';
                    if (fromIP) item += user_2.ip + '  ';
                    item += _this.getUserName(user_2.id) + '\n\n';
                    content += item;
                });
                $('#analise-result').val(content.trim()).removeClass('d-none');
                this.initShowIpButton(true);
                $('#hide-ip-checker-box').removeClass('d-none');
            } else {
                new Notify().show('Пересечений не найдено!', 'warning');
            }
        };

        this.initShowIpButton = function (isShow) {
            var btn = $('#hide-show-ip-btn');
            if (isShow) {
                btn.removeClass('btn-danger').addClass('showed').addClass('btn-warning');
            } else {
                btn.removeClass('btn-warning').removeClass('showed').addClass('btn-danger');
            }
            var content = (isShow) ? '<i class="fa fa-eye-slash"> Скрыть IP</i>' : '<i class="fa fa-eye"> Показать IP</i>';
            btn.html(content);
        }
    };

    var sett = new Settings();
    sett.init();
    var notify = new Notify();
    var storage = sett.store;
    var data = new DataHelper();
    var templater = new Templater();
    var app = new Application(templater, sett, storage);
    app.init(sett.body);
    var analizer = new Analizer();

    $('#show-intersections-modal').on('click', function () {
        app.intersectionsBuild();
        $('#work-panel').modal();
    });

    /*$('#show-whoises-modal').on('click', function () {
        app.whoisesBuild();
        $('#work-panel').modal();
    });*/

    $('#work-panel').on('click', '.add-user-in-list', function () {
        var uidf = $('#add-user-id');
        var uid = parseInt(uidf.val());
        if (uid > 0) {
            var users = JSON.parse(storage.get(sett.usersStoreKey));
            users = (users === null) ? [] : users;
            if (!data.checkIssetItemInObjectsList(users, 'id', uid)) {
                new Ajax().init(
                    'http://www.gwars.ru/info.php',
                    'get',
                    { id: uid},
                    'html',
                    true,
                    function (r) {
                        var res = $($.parseHTML(r)).find('#namespan > b').text();
                        if (res !== '') {
                            users.push({id: uid, name: res});
                            storage.set(sett.usersStoreKey, JSON.stringify(users));
                            uidf.val('');
                            templater.addUsersIntoFilterList($('#users-filter-list'), users);
                        } else {
                            notify.show('Персонаж не найден!', 'danger')
                        }
                        res = null;
                    }
                );
            } else {
                notify.show('Персонаж уже есть в списке!', 'danger')
            }
        } else {
            uidf.focus();
        }
    });

    $('#work-panel').on('click', '.remove-user-from-filter', function () {
        var uid = parseInt($(this).data('uid'));
        if (uid > 0) {
            var users = JSON.parse(storage.get(sett.usersStoreKey));
            users = data.removeItemFromObjectsList(users, 'id', uid);
            storage.set(sett.usersStoreKey, JSON.stringify(users));
            templater.addUsersIntoFilterList($('#users-filter-list'), users);
        }
    });

    $('#work-panel').on('change', '.check-user-in-filter', function () {
        var filterList = $('#users-filter-list');
        var count = filterList.find('.check-user-in-filter:checked').length;
        filterList.find('.check-user-in-filter').not(':checked').attr('disabled', count >= 2);
    });

    $('#work-panel').on('click', '#start-analise-btn', function () {
        $('#analise-result').val('').addClass('d-none');
        $('#hide-ip-checker-box').addClass('d-none');
        var users = [];
        var usersNames = [];
        var checkedUsersFields = $('#users-filter-list').find('.check-user-in-filter:checked');
        if (checkedUsersFields.length !== 2) {
            notify.show('Не выбраны персонажи для анализа!', 'danger');
            return false;
        }
        var checkedPeriods = $('#periods-select').val();
        if (checkedPeriods === null || checkedPeriods.length === 0) {
            notify.show('Не указан период для анализа!', 'danger');
            return false;
        }
        if (checkedPeriods.indexOf("0") !== -1 && checkedPeriods.indexOf("-1") !== -1) {
            checkedPeriods.splice(checkedPeriods.indexOf("-1"), 1);
        }
        var interval = $('#analise-time-interval').val();
        if (interval === '' || parseInt(interval) <= 0) {
            notify.show('Не указан интервал!', 'danger');
            return false;
        }
        $.each(checkedUsersFields, function() {
            var chID = $(this).val();
            users.push(chID);
            var chName = $(this).closest('.form-check').find('label').text();
            //usersNames.push({id: chID, name: chName});
            usersNames['u' + chID] = chName;
        });
        var periods = checkedPeriods.sort(function (a, b) {
            a = parseInt(a);
            b = parseInt(b);
            if (a <= 0) a += 1000;
            if (b <= 0) b += 1000;
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
        analizer.init(users, periods, interval);
        analizer.setUsersNames(usersNames);
        analizer.start();
    });

    $('#work-panel').on('click', '#hide-show-ip-btn', function () {
        var is_show = $(this).hasClass('showed');
        analizer.showParseResult(!is_show);
        analizer.initShowIpButton(!is_show);
    });

    $('#work-panel').on('click', '#copy-log-to-board-btn', function () {
        var elem = document.getElementById('analise-result');
        var target, origSelectionStart, origSelectionEnd;
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch(e) {
            succeed = false;
        }
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        if (succeed) {
            notify.show('Скопировано в буфер обмена!', 'success');
        } else {
            notify.show('Информация не скопирована!', 'danger');
        }
        return succeed;
    });
});