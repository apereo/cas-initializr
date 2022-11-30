package org.apereo.cas.initializr.web.ui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * This is {@link InitializrHomeController}.
 *
 * @author Misagh Moayyed
 * @since 7.0.0
 */
@Controller
public class InitializrHomeController {
    @GetMapping("/ui")
    public ModelAndView home() {
        return new ModelAndView("index");
    }
}
