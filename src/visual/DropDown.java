package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class DropDown extends SubElement {
	
	Props dropDownClickable; // Elemento che se cliccato fa comparire il dropDownElement.
	Props dropDownElement; //L'elemento che compare in seguito al click.

	public DropDown(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(SubElement.class);
		
		this.dropDownClickable=new Props(IdGenerator.getNextIdProps(),
				                                  type, false, false,1);
		this.dropDownElement=new Props(IdGenerator.getNextIdProps(),
				                                  type, false, false,1);
		
		this.props.put("dropDownClickable",dropDownClickable);
		this.props.put("dropDownElement",dropDownElement);
		
	}

}
